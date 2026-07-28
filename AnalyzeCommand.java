package dev.codemedic.cli;

import dev.codemedic.config.AppConfig;
import dev.codemedic.core.CodeFile;
import dev.codemedic.core.ContextBuilder;
import dev.codemedic.core.DebugSession;
import dev.codemedic.core.FileLoader;
import dev.codemedic.llm.LlmException;
import dev.codemedic.llm.LlmProvider;
import dev.codemedic.llm.LlmProviderFactory;
import dev.codemedic.llm.LlmRequest;
import dev.codemedic.output.TerminalRenderer;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Callable;

@Command(
        name = "analyze",
        description = "Analyze source code files for bugs and issues",
        mixinStandardHelpOptions = true
)
public class AnalyzeCommand implements Callable<Integer> {

    @Parameters(index = "0", description = "File or directory to analyze")
    private String path;

    @Option(names = {"--focus", "-f"}, description = "Focus area for analysis (e.g., 'null pointer', 'memory leak')")
    private String focus;

    @Option(names = {"--depth", "-d"}, description = "Max directory traversal depth", defaultValue = "10")
    private int depth;

    @Option(names = {"--model", "-m"}, description = "Override the LLM model")
    private String model;

    private final AppConfig appConfig;
    private final TerminalRenderer renderer;
    private final boolean verbose;

    public AnalyzeCommand() {
        this(new AppConfig(), new TerminalRenderer(), false);
    }

    AnalyzeCommand(AppConfig appConfig, TerminalRenderer renderer, boolean verbose) {
        this.appConfig = appConfig;
        this.renderer = renderer;
        this.verbose = verbose;
    }

    @Override
    public Integer call() {
        try {
            renderer.info("Analyzing " + path + "...");
            renderer.println("");

            FileLoader loader = new FileLoader();
            List<CodeFile> files = loadFiles(loader);

            if (files.isEmpty()) {
                renderer.warning("No source files found at: " + path);
                return 1;
            }

            renderer.info("Loaded " + files.size() + " file(s)");
            if (verbose) {
                for (CodeFile file : files) {
                    renderer.println("  - " + file.path() + " (" + file.lineCount() + " lines)");
                }
            }
            renderer.println("");

            ContextBuilder contextBuilder = new ContextBuilder();
            String userPrompt = contextBuilder.buildAnalysisPrompt(files, focus);

            LlmProvider provider = LlmProviderFactory.create(appConfig);
            LlmRequest request = new LlmRequest(
                    contextBuilder.getSystemPrompt(),
                    List.of(new dev.codemedic.llm.LlmMessage("user", userPrompt)),
                    resolveModel(),
                    appConfig.getMaxTokens()
            );

            renderer.assistantPrefix();
            StringBuilder response = new StringBuilder();
            provider.analyzeStreaming(request, token -> {
                renderer.streamToken(token);
                response.append(token);
            });
            renderer.finishStream();

            return 0;
        } catch (LlmException e) {
            renderer.error(e.getMessage());
            return 1;
        } catch (IOException e) {
            renderer.error("Failed to read files: " + e.getMessage());
            return 1;
        }
    }

    private List<CodeFile> loadFiles(FileLoader loader) throws IOException {
        if (path.contains("*") || path.contains("?")) {
            return loader.loadGlob(path, depth);
        }
        return loader.loadPath(path, depth);
    }

    private String resolveModel() {
        return model != null ? model : appConfig.getModel();
    }
}
