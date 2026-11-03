package dev.codemedic.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class FileLoader {

    private static final Logger log = LoggerFactory.getLogger(FileLoader.class);

    private static final Set<String> SOURCE_EXTENSIONS = Set.of(
            "java", "kt", "py", "js", "ts", "tsx", "jsx", "go", "rs", "rb", "php",
            "c", "cpp", "h", "hpp", "cs", "swift", "scala", "sh", "bash", "sql",
            "xml", "html", "css", "scss", "yaml", "yml", "json", "toml", "md", "gradle"
    );

    private final List<Pattern> gitignorePatterns = new ArrayList<>();

    public List<CodeFile> loadPath(String pathSpec, int maxDepth) throws IOException {
        Path path = Paths.get(pathSpec).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new IOException("Path not found: " + path);
        }

        loadGitignore(path);

        if (Files.isRegularFile(path)) {
            return List.of(readFile(path));
        }

        Path root = Files.isDirectory(path) ? path : path.getParent();
        List<CodeFile> files = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(path, maxDepth, FileVisitOption.FOLLOW_LINKS)) {
            walk.filter(Files::isRegularFile)
                    .filter(p -> !isIgnored(p, root))
                    .filter(this::isSourceFile)
                    .forEach(p -> {
                        try {
                            files.add(readFile(p));
                        } catch (IOException e) {
                            log.warn("Skipping unreadable file {}: {}", p, e.getMessage());
                        }
                    });
        }
        return Collections.unmodifiableList(files);
    }

    public CodeFile loadSingleFile(String pathSpec) throws IOException {
        Path path = Paths.get(pathSpec).toAbsolutePath().normalize();
        if (!Files.isRegularFile(path)) {
            throw new IOException("File not found: " + path);
        }
        return readFile(path);
    }

    public List<CodeFile> loadGlob(String globPattern, int maxDepth) throws IOException {
        int lastSep = Math.max(globPattern.lastIndexOf('/'), globPattern.lastIndexOf('\\'));
        Path root;
        String filePattern;
        if (lastSep >= 0) {
            root = Paths.get(globPattern.substring(0, lastSep)).toAbsolutePath().normalize();
            filePattern = globPattern.substring(lastSep + 1);
        } else {
            root = Paths.get(".").toAbsolutePath().normalize();
            filePattern = globPattern;
        }

        loadGitignore(root);

        Pattern regex = globToRegex(filePattern);
        List<CodeFile> files = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(root, maxDepth, FileVisitOption.FOLLOW_LINKS)) {
            walk.filter(Files::isRegularFile)
                    .filter(p -> regex.matcher(p.getFileName().toString()).matches())
                    .filter(p -> !isIgnored(p, root))
                    .forEach(p -> {
                        try {
                            files.add(readFile(p));
                        } catch (IOException e) {
                            log.warn("Skipping unreadable file {}: {}", p, e.getMessage());
                        }
                    });
        }
        return Collections.unmodifiableList(files);
    }

    CodeFile readFile(Path path) throws IOException {
        Charset charset = detectCharset(path);
        String content = Files.readString(path, charset);
        String language = detectLanguage(path);
        int lineCount = content.isEmpty() ? 0 : (int) content.lines().count();
        return new CodeFile(path, language, content, lineCount);
    }

    private Charset detectCharset(Path path) throws IOException {
        byte[] bytes = Files.readAllBytes(path);
        if (bytes.length >= 3 && bytes[0] == (byte) 0xEF && bytes[1] == (byte) 0xBB && bytes[2] == (byte) 0xBF) {
            return StandardCharsets.UTF_8;
        }
        String sample = new String(bytes, 0, Math.min(bytes.length, 4096), StandardCharsets.UTF_8);
        if (sample.contains("\uFFFD")) {
            return Charset.defaultCharset();
        }
        return StandardCharsets.UTF_8;
    }

    private String detectLanguage(Path path) {
        String name = path.getFileName().toString();
        int dot = name.lastIndexOf('.');
        if (dot < 0) {
            return "text";
        }
        return switch (name.substring(dot + 1).toLowerCase()) {
            case "java" -> "java";
            case "kt", "kts" -> "kotlin";
            case "py" -> "python";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "tsx" -> "tsx";
            case "jsx" -> "jsx";
            case "go" -> "go";
            case "rs" -> "rust";
            case "rb" -> "ruby";
            case "php" -> "php";
            case "c", "h" -> "c";
            case "cpp", "hpp", "cc" -> "cpp";
            case "cs" -> "csharp";
            case "swift" -> "swift";
            case "scala" -> "scala";
            case "sh", "bash" -> "shell";
            case "sql" -> "sql";
            case "xml" -> "xml";
            case "html", "htm" -> "html";
            case "css" -> "css";
            case "scss" -> "scss";
            case "yaml", "yml" -> "yaml";
            case "json" -> "json";
            case "toml" -> "toml";
            case "md" -> "markdown";
            case "gradle" -> "gradle";
            default -> name.substring(dot + 1);
        };
    }

    private boolean isSourceFile(Path path) {
        String name = path.getFileName().toString();
        int dot = name.lastIndexOf('.');
        if (dot < 0) {
            return false;
        }
        return SOURCE_EXTENSIONS.contains(name.substring(dot + 1).toLowerCase());
    }

    private void loadGitignore(Path path) {
        gitignorePatterns.clear();
        Path dir = Files.isDirectory(path) ? path : path.getParent();
        if (dir == null) {
            return;
        }
        Path gitignore = dir.resolve(".gitignore");
        if (!Files.isRegularFile(gitignore)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(gitignore, StandardCharsets.UTF_8);
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                gitignorePatterns.add(gitignoreToRegex(line));
            }
        } catch (IOException e) {
            log.debug("Could not read .gitignore: {}", e.getMessage());
        }
    }

    boolean isIgnored(Path file, Path root) {
        if (gitignorePatterns.isEmpty()) {
            return false;
        }
        Path relative = root.relativize(file);
        String relativePath = relative.toString().replace('\\', '/');
        String fileName = file.getFileName().toString();

        for (Pattern pattern : gitignorePatterns) {
            if (pattern.matcher(relativePath).matches() || pattern.matcher(fileName).matches()) {
                return true;
            }
        }
        return false;
    }

    private Pattern gitignoreToRegex(String original) {
        boolean directoryOnly = original.endsWith("/");
        String pattern = original;
        if (pattern.startsWith("/")) {
            pattern = pattern.substring(1);
        }
        if (directoryOnly) {
            pattern = pattern.substring(0, pattern.length() - 1);
        }

        StringBuilder regex = new StringBuilder("^");
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            switch (c) {
                case '*' -> {
                    if (i + 1 < pattern.length() && pattern.charAt(i + 1) == '*') {
                        regex.append(".*");
                        i++;
                        if (i + 1 < pattern.length() && pattern.charAt(i + 1) == '/') {
                            i++;
                        }
                    } else {
                        regex.append("[^/]*");
                    }
                }
                case '?' -> regex.append("[^/]");
                case '.' -> regex.append("\\.");
                default -> regex.append(Pattern.quote(String.valueOf(c)));
            }
        }
        if (directoryOnly) {
            regex.append("(/.*)?");
        }
        regex.append("$");
        return Pattern.compile(regex.toString());
    }

    private Pattern globToRegex(String glob) {
        StringBuilder regex = new StringBuilder("^");
        for (int i = 0; i < glob.length(); i++) {
            char c = glob.charAt(i);
            switch (c) {
                case '*' -> {
                    if (i + 1 < glob.length() && glob.charAt(i + 1) == '*') {
                        regex.append(".*");
                        i++;
                    } else {
                        regex.append("[^/]*");
                    }
                }
                case '?' -> regex.append(".");
                case '.' -> regex.append("\\.");
                default -> regex.append(Pattern.quote(String.valueOf(c)));
            }
        }
        regex.append("$");
        return Pattern.compile(regex.toString());
    }
}
