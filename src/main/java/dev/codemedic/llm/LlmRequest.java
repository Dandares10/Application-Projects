package dev.codemedic.llm;

import java.util.List;

public record LlmRequest(
        String systemPrompt,
        List<LlmMessage> messages,
        String model,
        int maxTokens
) {
    public LlmRequest {
        messages = List.copyOf(messages);
    }
}
