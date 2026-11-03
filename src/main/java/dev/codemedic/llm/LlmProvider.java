package dev.codemedic.llm;

import java.util.function.Consumer;

public interface LlmProvider {

    LlmResponse analyze(LlmRequest request);

    void analyzeStreaming(LlmRequest request, Consumer<String> onToken);
}
