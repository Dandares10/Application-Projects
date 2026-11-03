package dev.codemedic.llm;

import dev.codemedic.config.AppConfig;

public final class LlmProviderFactory {

    private LlmProviderFactory() {
    }

    public static LlmProvider create(AppConfig config) {
        return switch (config.getProvider().toLowerCase()) {
            case "ollama" -> new OllamaProvider(config.getOllamaBaseUrl());
            case "anthropic" -> new AnthropicProvider(config.getApiKey());
            default -> throw new LlmException("Unknown LLM provider: " + config.getProvider()
                    + ". Supported: ollama, anthropic");
        };
    }
}
