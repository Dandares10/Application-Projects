package dev.codemedic;

import org.junit.jupiter.api.Test;
import picocli.CommandLine;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;

import static org.junit.jupiter.api.Assertions.*;

class CodeMedicAppTest {

    @Test
    void helpOutputsUsage() {
        CommandLine cmd = new CommandLine(new CodeMedicApp());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        cmd.setOut(new PrintWriter(out, true));

        int exitCode = cmd.execute("--help");

        assertEquals(0, exitCode);
        String output = out.toString();
        assertTrue(output.contains("codemedic"));
        assertTrue(output.contains("analyze"));
        assertTrue(output.contains("chat"));
        assertTrue(output.contains("config"));
    }
}
