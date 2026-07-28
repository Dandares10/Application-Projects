package dev.codemedic.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FileLoaderTest {

    private FileLoader loader;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        loader = new FileLoader();
    }

    @Test
    void readsSingleFile() throws IOException {
        Path file = tempDir.resolve("Main.java");
        Files.writeString(file, "public class Main {\n    void run() {}\n}");

        CodeFile codeFile = loader.loadSingleFile(file.toString());

        assertEquals("java", codeFile.language());
        assertEquals(3, codeFile.lineCount());
        assertTrue(codeFile.content().contains("public class Main"));
    }

    @Test
    void detectsLanguageFromExtension() throws IOException {
        Path file = tempDir.resolve("script.py");
        Files.writeString(file, "print('hello')");

        CodeFile codeFile = loader.loadSingleFile(file.toString());

        assertEquals("python", codeFile.language());
    }

    @Test
    void loadsDirectoryRespectingGitignore() throws IOException {
        Files.writeString(tempDir.resolve(".gitignore"), "ignored/\n*.class\n");
        Files.createDirectories(tempDir.resolve("ignored"));
        Files.writeString(tempDir.resolve("ignored/Hidden.java"), "class Hidden {}");
        Files.writeString(tempDir.resolve("Visible.java"), "class Visible {}");
        Files.writeString(tempDir.resolve("App.class"), "binary");

        List<CodeFile> files = loader.loadPath(tempDir.toString(), 3);

        assertEquals(1, files.size());
        assertEquals("Visible.java", files.get(0).path().getFileName().toString());
    }

    @Test
    void isIgnoredMatchesPatterns() {
        Path root = tempDir;
        loader.isIgnored(root.resolve("node_modules/pkg/index.js"), root);
        // Without gitignore loaded, nothing is ignored
        assertFalse(loader.isIgnored(root.resolve("src/Main.java"), root));
    }

    @Test
    void throwsForMissingFile() {
        assertThrows(IOException.class, () -> loader.loadSingleFile(tempDir.resolve("missing.java").toString()));
    }

    @Test
    void loadsGlobPattern() throws IOException {
        Files.writeString(tempDir.resolve("A.java"), "class A {}");
        Files.writeString(tempDir.resolve("B.txt"), "not source");
        Files.writeString(tempDir.resolve("C.java"), "class C {}");

        String glob = tempDir.toAbsolutePath() + java.io.File.separator + "*.java";
        List<CodeFile> files = loader.loadGlob(glob, 1);

        assertEquals(2, files.size());
    }
}
