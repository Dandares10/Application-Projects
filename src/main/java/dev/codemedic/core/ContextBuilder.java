package dev.codemedic.core;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class ContextBuilder {

    private static final int DEFAULT_MAX_CHARS = 100_000;
    private static final String SYSTEM_PROMPT_RESOURCE = "/system-prompts/debugger.txt";

    private final int maxChars;
    private final String systemPrompt;

    public ContextBuilder() {
        this(DEFAULT_MAX_CHARS);
    }

    public ContextBuilder(int maxChars) {
        this.maxChars = maxChars;
        this.systemPrompt = loadSystemPrompt();
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public String buildAnalysisPrompt(List<CodeFile> files, String focus) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analyze the following code for bugs, logic errors, edge cases, and potential issues.\n\n");

        if (focus != null && !focus.isBlank()) {
            sb.append("Focus area: ").append(focus.trim()).append("\n\n");
        }

        appendCodeFiles(sb, files);
        sb.append("\nProvide a thorough analysis with specific line references and suggested fixes.");
        return sb.toString();
    }

    public String buildCodeContext(List<CodeFile> files) {
        StringBuilder sb = new StringBuilder();
        sb.append("Here is the code context for our debugging session:\n\n");
        appendCodeFiles(sb, files);
        return sb.toString();
    }

    private void appendCodeFiles(StringBuilder sb, List<CodeFile> files) {
        int remaining = maxChars;
        for (CodeFile file : files) {
            String formatted = formatFile(file);
            if (formatted.length() > remaining) {
                formatted = truncateFile(file, remaining);
            }
            if (formatted.isEmpty()) {
                break;
            }
            sb.append(formatted).append("\n");
            remaining -= formatted.length();
        }
    }

    String formatFile(CodeFile file) {
        StringBuilder sb = new StringBuilder();
        String fileName = file.path().getFileName().toString();
        sb.append("--- ").append(fileName)
                .append(" (").append(file.language()).append(", ")
                .append(file.lineCount()).append(" lines) ---\n");

        String[] lines = file.content().split("\n", -1);
        int width = String.valueOf(lines.length).length();
        for (int i = 0; i < lines.length; i++) {
            sb.append(String.format("%" + width + "d", i + 1))
                    .append("| ")
                    .append(lines[i])
                    .append("\n");
        }
        return sb.toString();
    }

    private String truncateFile(CodeFile file, int maxLength) {
        if (maxLength < 100) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        String fileName = file.path().getFileName().toString();
        sb.append("--- ").append(fileName)
                .append(" (").append(file.language()).append(", ")
                .append(file.lineCount()).append(" lines, TRUNCATED) ---\n");

        String[] lines = file.content().split("\n", -1);
        int width = String.valueOf(lines.length).length();
        int used = sb.length();
        int included = 0;

        for (int i = 0; i < lines.length; i++) {
            String line = String.format("%" + width + "d", i + 1) + "| " + lines[i] + "\n";
            if (used + line.length() > maxLength - 50) {
                break;
            }
            sb.append(line);
            used += line.length();
            included++;
        }
        sb.append("... [truncated, showing ").append(included).append(" of ")
                .append(lines.length).append(" lines]\n");
        return sb.toString();
    }

    private String loadSystemPrompt() {
        try (InputStream is = getClass().getResourceAsStream(SYSTEM_PROMPT_RESOURCE)) {
            if (is == null) {
                throw new IllegalStateException("System prompt not found: " + SYSTEM_PROMPT_RESOURCE);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load system prompt", e);
        }
    }
}
