package dev.codemedic;

import dev.codemedic.cli.AnalyzeCommand;
import dev.codemedic.cli.ChatCommand;
import dev.codemedic.cli.ConfigCommand;
import dev.codemedic.output.TerminalRenderer;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

@Command(
        name = "codemedic",
        description = "AI-powered debugging agent for your codebase",
        mixinStandardHelpOptions = true,
        version = "CodeMedic 0.1.0",
        subcommands = {
                AnalyzeCommand.class,
                ChatCommand.class,
                ConfigCommand.class,
                CommandLine.HelpCommand.class
        }
)
public class CodeMedicApp implements Runnable {

    @Option(names = {"--verbose", "-v"}, description = "Enable verbose output")
    boolean verbose;

    @Option(names = {"--no-color"}, description = "Disable colored terminal output")
    boolean noColor;

    @Option(names = {"--model", "-m"}, description = "Override the default LLM model")
    String model;

    @Override
    public void run() {
        TerminalRenderer renderer = new TerminalRenderer(System.out, !noColor);
        renderer.printBanner();
        new CommandLine(this).usage(System.out);
    }

    public static void main(String[] args) {
        int exitCode = new CommandLine(new CodeMedicApp())
                .setCaseInsensitiveEnumValuesAllowed(true)
                .execute(args);
        System.exit(exitCode);
    }
}
