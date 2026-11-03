package dev.codemedic.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.function.Consumer;

public class AnthropicProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(AnthropicProvider.class);
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AnthropicProvider(String apiKey) {
        this(apiKey, HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build());
    }

    AnthropicProvider(String apiKey, HttpClient httpClient) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException(
                    "Anthropic API key is required. Set ANTHROPIC_API_KEY or run: codemedic config set-key <key>");
        }
        this.apiKey = apiKey;
        this.httpClient = httpClient;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public LlmResponse analyze(LlmRequest request) {
        StringBuilder content = new StringBuilder();
        analyzeStreaming(request, content::append);
        return new LlmResponse(content.toString(), 0, 0, "end_turn");
    }

    @Override
    public void analyzeStreaming(LlmRequest request, Consumer<String> onToken) {
        try {
            ObjectNode body = buildRequestBody(request, true);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .header("Content-Type", "application/json")
                    .header("Accept", "text/event-stream")
                    .timeout(Duration.ofMinutes(5))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<java.io.InputStream> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                throw mapHttpError(response.statusCode(), errorBody);
            }

            parseSseStream(response.body(), onToken);
        } catch (LlmException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("Request interrupted", e);
        } catch (IOException e) {
            throw new LlmException("Network error communicating with Anthropic API: " + e.getMessage(), e);
        }
    }

    private ObjectNode buildRequestBody(LlmRequest request, boolean stream) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", request.model());
        body.put("max_tokens", request.maxTokens());
        body.put("stream", stream);
        body.put("system", request.systemPrompt());

        ArrayNode messages = body.putArray("messages");
        for (LlmMessage message : request.messages()) {
            ObjectNode msg = messages.addObject();
            msg.put("role", message.role());
            msg.put("content", message.content());
        }
        return body;
    }

    private void parseSseStream(java.io.InputStream inputStream, Consumer<String> onToken) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("data: ")) {
                    continue;
                }
                String data = line.substring(6);
                if ("[DONE]".equals(data)) {
                    break;
                }
                JsonNode event = objectMapper.readTree(data);
                String type = event.path("type").asText();

                if ("content_block_delta".equals(type)) {
                    String text = event.path("delta").path("text").asText("");
                    if (!text.isEmpty()) {
                        onToken.accept(text);
                    }
                } else if ("error".equals(type)) {
                    String message = event.path("error").path("message").asText("Unknown API error");
                    throw new LlmException(message);
                }
            }
        }
    }

    private LlmException mapHttpError(int statusCode, String body) {
        log.debug("Anthropic API error {}: {}", statusCode, body);
        String message;
        switch (statusCode) {
            case 401 -> message = "Invalid API key. Check your Anthropic API key.";
            case 403 -> message = "Access forbidden. Your API key may lack required permissions.";
            case 429 -> message = "Rate limit exceeded. Please wait and try again.";
            case 500, 502, 503, 529 -> message = "Anthropic API is temporarily unavailable. Try again later.";
            default -> {
                try {
                    JsonNode error = objectMapper.readTree(body);
                    message = error.path("error").path("message").asText("API request failed (HTTP " + statusCode + ")");
                } catch (IOException e) {
                    message = "API request failed (HTTP " + statusCode + ")";
                }
            }
        }
        return new LlmException(message);
    }
}
