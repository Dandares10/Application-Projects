package dev.codemedic.llm;

public record LlmResponse(
        String content,
        int inputTokens,
        int outputTokens,
        String stopReason
) {
}
