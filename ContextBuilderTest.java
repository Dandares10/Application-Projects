package dev.codemedic.core;

import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ContextBuilderTest {

    @Test
    void buildsAnalysisPromptWithFocus() {
        ContextBuilder builder = new ContextBuilder();
        CodeFile file = new CodeFile(Path.of("Main.java"), "java", "public class Main {}", 1);

        String prompt = builder.buildAnalysisPrompt(List.of(file), "null pointer");

        assertTrue(prompt.contains("Focus area: null pointer"));
        assertTrue(prompt.contains("--- Main.java (java, 1 lines) ---"));
        assertTrue(prompt.contains("1| public class Main {}"));
    }

    @Test
    void formatsFilesWithLineNumbers() {
        ContextBuilder builder = new ContextBuilder();
        CodeFile file = new CodeFile(Path.of("test.py"), "python", "line1\nline2\nline3", 3);

        String formatted = builder.formatFile(file);

        assertTrue(formatted.contains("1| line1"));
        assertTrue(formatted.contains("2| line2"));
        assertTrue(formatted.contains("3| line3"));
    }

    @Test
    void loadsSystemPrompt() {
        ContextBuilder builder = new ContextBuilder();

        String prompt = builder.getSystemPrompt();

        assertNotNull(prompt);
        assertTrue(prompt.contains("CodeMedic"));
        assertFalse(prompt.isBlank());
    }

    @Test
    void truncatesLargeFiles() {
        ContextBuilder builder = new ContextBuilder(200);
        StringBuilder content = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            content.append("line ").append(i).append("\n");
        }
        CodeFile file = new CodeFile(Path.of("big.java"), "java", content.toString(), 100);

        String prompt = builder.buildAnalysisPrompt(List.of(file), null);

        assertTrue(prompt.contains("TRUNCATED"));
        assertTrue(prompt.length() < content.length());
    }
}
