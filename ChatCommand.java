package dev.codemedic.cli;

import dev.codemedic.config.AppConfig;
import dev.codemedic.core.CodeFile;
import dev.codemedic.core.ContextBuilder;
import dev.codemedic.core.DebugSession;
import dev.codemedic.core.FileLoader;
import dev.codemedic.llm.LlmException;
import dev.codemedic.llm.LlmMessage;
import dev.codemedic.llm.LlmProvider;
import dev.codemedic.llm.LlmProviderFactory;
import dev.codemedic.llm.LlmRequest;
import dev.codemedic.output.TerminalRenderer;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

@Command(
        name = "chat",
        description = "Start an interactive debugging chat session",
        mixinStandardHelpOptions = true
)
public class ChatCommand implements Callable<Integer> {

    @Option(names = {"--file", "-f"}, description = "Initial file to load into context")
    private String initialFile;

    @Option(names = {"--model", "-m"}, description = "Override the LLM model")
    private String model;

    private final AppConfig appConfig;
    private final TerminalRenderer renderer;
    private final BufferedReader reader;

    public ChatCommand() {
        this(new AppConfig(), new TerminalRenderer(),
                new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8)));
    }

    ChatCommand(AppConfig appConfig, TerminalRenderer renderer, BufferedReader reader) {
        this.appConfig = appConfig;
        this.renderer = renderer;
        this.reader = reader;
    }

    @Override
    public Integer call() {
        try {
            DebugSession session = new DebugSession();
            ContextBuilder contextBuilder = new ContextBuilder();
            FileLoader loader = new FileLoader();
            LlmProvider provider = LlmProviderFactory.create(appConfig);

            renderer.println(colorBold("🩺 CodeMedic Debug Session"));
            renderer.println(colorDim("   Type your question, or /help for commands."));
            renderer.println("");

            if (initialFile != null) {
                loadFile(session, loader, initialFile);
            }

            while (true) {
                renderer.prompt("> ");
                String input = reader.readLine();
                if (input == null) {
                    break;
                }
                input = input.trim();
                if (input.isEmpty()) {
                    continue;
                }

                if (input.startsWith("/")) {
                    if (handleCommand(input, session, loader)) {
                        break;
                    }
                    continue;
                }

                sendMessage(session, contextBuilder, provider, input);
            }

            renderer.println(colorDim("Goodbye!"));
            return 0;
        } catch (LlmException e) {
            renderer.error(e.getMessage());
            return 1;
        } catch (IOException e) {
            renderer.error("I/O error: " + e.getMessage());
            return 1;
        }
    }

    private boolean handleCommand(String input, DebugSession session, FileLoader loader) throws IOException {
        String[] parts = input.split("\\s+", 2);
        String command = parts[0].toLowerCase();

        return switch (command) {
            case "/exit", "/quit" -> true;
            case "/clear" -> {
                session.clearMessages();
                renderer.info("Conversation cleared.");
                yield false;
            }
            case "/files" -> {
                if (!session.hasContextFiles()) {
                    renderer.info("No files in context.");
                } else {
                    renderer.info("Files in context:");
                    for (CodeFile file : session.getContextFiles()) {
                        renderer.println("  📎 " + file.path() + " (" + file.lineCount() + " lines)");
                    }
                }
                yield false;
            }
            case "/file" -> {
                if (parts.length < 2) {
                    renderer.warning("Usage: /file <path>");
                } else {
                    loadFile(session, loader, parts[1].trim());
                }
                yield false;
            }
            case "/help" -> {
                printHelp();
                yield false;
            }
            default -> {
                renderer.warning("Unknown command: " + command + ". Type /help for available commands.");
                yield false;
            }
        };
    }

    private void loadFile(DebugSession session, FileLoader loader, String path) throws IOException {
        CodeFile file = loader.loadSingleFile(path);
        session.addFile(file);
        renderer.success("Added " + file.path().getFileName() + " to context (" + file.lineCount() + " lines)");
    }

    private void sendMessage(DebugSession session, ContextBuilder contextBuilder,
                             LlmProvider provider, String userInput) {
        List<LlmMessage> requestMessages = new ArrayList<>();

        if (session.hasContextFiles() && !session.isContextSent()) {
            String context = contextBuilder.buildCodeContext(session.getContextFiles());
            requestMessages.add(new LlmMessage("user", context));
            requestMessages.add(new LlmMessage("assistant",
                    "I've reviewed the code files. What would you like me to help debug?"));
            session.markContextSent();
        }

        session.addUserMessage(userInput);
        requestMessages.addAll(session.getMessages());

        LlmRequest request = new LlmRequest(
                contextBuilder.getSystemPrompt(),
                requestMessages,
                resolveModel(),
                appConfig.getMaxTokens()
        );

        renderer.println("");
        renderer.assistantPrefix();

        StringBuilder response = new StringBuilder();
        try {
            provider.analyzeStreaming(request, token -> {
                renderer.streamToken(token);
                response.append(token);
            });
            renderer.finishStream();
            session.addAssistantMessage(response.toString());
        } catch (LlmException e) {
            renderer.println("");
            renderer.error(e.getMessage());
            removeLastUserMessage(session);
        }
        renderer.println("");
    }

    private void printHelp() {
        renderer.println("");
        renderer.println(colorBold("Available commands:"));
        renderer.println("  /file <path>  Add a file to the debugging context");
        renderer.println("  /files        List files currently in context");
        renderer.println("  /clear        Clear conversation history");
        renderer.println("  /help         Show this help message");
        renderer.println("  /exit         End the chat session");
        renderer.println("");
    }

    private void removeLastUserMessage(DebugSession session) {
        List<LlmMessage> msgs = new ArrayList<>(session.getMessages());
        if (msgs.isEmpty()) {
            return;
        }
        msgs.remove(msgs.size() - 1);
        session.clearMessages();
        for (LlmMessage msg : msgs) {
            if ("user".equals(msg.role())) {
                session.addUserMessage(msg.content());
            } else {
                session.addAssistantMessage(msg.content());
            }
        }
    }

    private String resolveModel() {
        return model != null ? model : appConfig.getModel();
    }

    private String colorBold(String text) {
        return renderer.color("\u001B[1m", text);
    }

    private String colorDim(String text) {
        return renderer.color("\u001B[2m", text);
    }
}
