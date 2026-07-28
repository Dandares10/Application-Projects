package dev.codemedic.output;

import java.io.PrintStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TerminalRenderer {

    private static final String RESET = "\u001B[0m";
    private static final String BOLD = "\u001B[1m";
    private static final String DIM = "\u001B[2m";
    private static final String RED = "\u001B[31m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String CYAN = "\u001B[36m";
    private static final String MAGENTA = "\u001B[35m";

    private final PrintStream out;
    private final boolean colorEnabled;
    private boolean inCodeBlock;
    private final StringBuilder codeBlockBuffer = new StringBuilder();

    public TerminalRenderer() {
        this(System.out, true);
    }

    public TerminalRenderer(PrintStream out, boolean colorEnabled) {
        this.out = out;
        this.colorEnabled = colorEnabled;
    }

    public void printBanner() {
        println("");
        println(color(CYAN, "  ╔═══════════════════════════════════════╗"));
        println(color(CYAN, "  ║") + color(BOLD, "   🩺 CodeMedic — AI Debugging Agent  ") + color(CYAN, "║"));
        println(color(CYAN, "  ╚═══════════════════════════════════════╝"));
        println("");
    }

    public void info(String message) {
        println(color(CYAN, "ℹ ") + message);
    }

    public void success(String message) {
        println(color(GREEN, "✓ ") + message);
    }

    public void warning(String message) {
        println(color(YELLOW, "⚠ ") + message);
    }

    public void error(String message) {
        println(color(RED, "✗ ") + message);
    }

    public void prompt(String message) {
        print(color(GREEN, message));
    }

    public void assistantPrefix() {
        print(color(MAGENTA, "🤖 "));
    }

    public void streamToken(String token) {
        renderStreamingMarkdown(token);
        out.flush();
    }

    public void finishStream() {
        if (inCodeBlock) {
            flushCodeBlock();
        }
        println("");
    }

    public void println(String message) {
        out.println(message);
    }

    public void print(String message) {
        out.print(message);
    }

    public void showSpinner(String message) {
        print(color(DIM, message + "..."));
        out.flush();
    }

    public void clearSpinner() {
        print("\r\u001B[2K");
    }

    public String color(String ansiCode, String text) {
        if (!colorEnabled) {
            return text;
        }
        return ansiCode + text + RESET;
    }

    private void renderStreamingMarkdown(String token) {
        StringBuilder pending = new StringBuilder(token);
        while (!pending.isEmpty()) {
            if (inCodeBlock) {
                int endIndex = pending.indexOf("```");
                if (endIndex >= 0) {
                    codeBlockBuffer.append(pending, 0, endIndex);
                    flushCodeBlock();
                    pending.delete(0, endIndex + 3);
                } else {
                    codeBlockBuffer.append(pending);
                    pending.setLength(0);
                }
            } else {
                int startIndex = pending.indexOf("```");
                if (startIndex >= 0) {
                    String before = pending.substring(0, startIndex);
                    printPlainWithBold(before);
                    inCodeBlock = true;
                    pending.delete(0, startIndex + 3);
                    int newline = pending.indexOf("\n");
                    if (newline >= 0) {
                        pending.delete(0, newline + 1);
                    }
                } else {
                    printPlainWithBold(pending.toString());
                    pending.setLength(0);
                }
            }
        }
    }

    private void printPlainWithBold(String text) {
        Pattern boldPattern = Pattern.compile("\\*\\*(.+?)\\*\\*");
        Matcher matcher = boldPattern.matcher(text);
        int lastEnd = 0;
        while (matcher.find()) {
            out.print(text.substring(lastEnd, matcher.start()));
            out.print(color(BOLD, matcher.group(1)));
            lastEnd = matcher.end();
        }
        out.print(text.substring(lastEnd));
    }

    private void flushCodeBlock() {
        out.print(color(CYAN, codeBlockBuffer.toString()));
        codeBlockBuffer.setLength(0);
        inCodeBlock = false;
    }
}
