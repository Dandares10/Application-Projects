package dev.codemedic.cli;

import dev.codemedic.config.AppConfig;
import dev.codemedic.output.TerminalRenderer;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.Callable;

@Command(
        name = "config",
        description = "Manage CodeMedic configuration",
        subcommands = {
                ConfigCommand.SetKeyCommand.class,
                ConfigCommand.ShowCommand.class,
                ConfigCommand.SetCommand.class
        },
        mixinStandardHelpOptions = true
)
public class ConfigCommand implements Callable<Integer> {

    @Override
    public Integer call() {
        System.out.println("Use 'codemedic config set-key', 'show', or 'set'.");
        return 0;
    }

    @Command(name = "set-key", description = "Save your Anthropic API key")
    static class SetKeyCommand implements Callable<Integer> {

        @Parameters(index = "0", description = "Your Anthropic API key")
        private String apiKey;

        private final AppConfig appConfig;
        private final TerminalRenderer renderer;

        SetKeyCommand() {
            this(new AppConfig(), new TerminalRenderer());
        }

        SetKeyCommand(AppConfig appConfig, TerminalRenderer renderer) {
            this.appConfig = appConfig;
            this.renderer = renderer;
        }

        @Override
        public Integer call() {
            try {
                appConfig.setApiKey(apiKey);
                renderer.success("API key saved to " + System.getProperty("user.home") + "/.codemedic/config");
                return 0;
            } catch (IOException e) {
                renderer.error("Failed to save API key: " + e.getMessage());
                return 1;
            }
        }
    }

    @Command(name = "show", description = "Display current configuration (API key masked)")
    static class ShowCommand implements Callable<Integer> {

        private final AppConfig appConfig;
        private final TerminalRenderer renderer;

        ShowCommand() {
            this(new AppConfig(), new TerminalRenderer());
        }

        ShowCommand(AppConfig appConfig, TerminalRenderer renderer) {
            this.appConfig = appConfig;
            this.renderer = renderer;
        }

        @Override
        public Integer call() {
            Map<String, String> config = appConfig.getDisplayConfig();
            renderer.println("");
            renderer.println(renderer.color("\u001B[1m", "CodeMedic Configuration"));
            renderer.println("");
            for (Map.Entry<String, String> entry : config.entrySet()) {
                renderer.println("  " + entry.getKey() + " = " + entry.getValue());
            }
            renderer.println("");
            return 0;
        }
    }

    @Command(name = "set", description = "Set a configuration value")
    static class SetCommand implements Callable<Integer> {

        @Parameters(index = "0", description = "Configuration key (e.g., codemedic.llm.model)")
        private String key;

        @Parameters(index = "1", description = "Configuration value")
        private String value;

        private final AppConfig appConfig;
        private final TerminalRenderer renderer;

        SetCommand() {
            this(new AppConfig(), new TerminalRenderer());
        }

        SetCommand(AppConfig appConfig, TerminalRenderer renderer) {
            this.appConfig = appConfig;
            this.renderer = renderer;
        }

        @Override
        public Integer call() {
            try {
                appConfig.setValue(key, value);
                renderer.success("Set " + key + " = " + value);
                return 0;
            } catch (IOException e) {
                renderer.error("Failed to save configuration: " + e.getMessage());
                return 1;
            }
        }
    }
}
