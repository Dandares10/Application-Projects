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
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.function.Consumer;

public class OllamaProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(OllamaProvider.class);
    private static final String DEFAULT_BASE_URL = "http://localhost:11434";

    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OllamaProvider() {
        this(DEFAULT_BASE_URL);
    }

    public OllamaProvider(String baseUrl) {
        this(baseUrl, HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build());
    }

    OllamaProvider(String baseUrl, HttpClient httpClient) {
        this.baseUrl = stripTrailingSlash(baseUrl);
        this.httpClient = httpClient;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public LlmResponse analyze(LlmRequest request) {
        StringBuilder content = new StringBuilder();
        analyzeStreaming(request, content::append);
        return new LlmResponse(content.toString(), 0, 0, "stop");
    }

    @Override
    public void analyzeStreaming(LlmRequest request, Consumer<String> onToken) {
        try {
            ObjectNode body = buildRequestBody(request, true);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/api/chat"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMinutes(10))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<java.io.InputStream> response = httpClient.send(
                    httpRequest, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                throw mapHttpError(response.statusCode(), errorBody);
            }

            parseNdjsonStream(response.body(), onToken);
        } catch (LlmException e) {
            throw e;
        } catch (ConnectException e) {
            throw new LlmException(
                    "Cannot connect to Ollama at " + baseUrl
                            + ". Is Ollama running? Start it with: ollama serve", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException("Request interrupted", e);
        } catch (IOException e) {
            throw new LlmException("Error calling Ollama: " + e.getMessage(), e);
        }
    }

    private ObjectNode buildRequestBody(LlmRequest request, boolean stream) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", request.model());
        body.put("stream", stream);

        ObjectNode options = body.putObject("options");
        options.put("num_predict", request.maxTokens());

        ArrayNode messages = body.putArray("messages");

        if (request.systemPrompt() != null && !request.systemPrompt().isBlank()) {
            ObjectNode system = messages.addObject();
            system.put("role", "system");
            system.put("content", request.systemPrompt());
        }

        for (LlmMessage message : request.messages()) {
            ObjectNode msg = messages.addObject();
            msg.put("role", message.role());
            msg.put("content", message.content());
        }

        return body;
    }

    private void parseNdjsonStream(java.io.InputStream inputStream, Consumer<String> onToken) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                JsonNode event = objectMapper.readTree(line);
                if (event.has("error")) {
                    throw new LlmException(event.path("error").asText("Unknown Ollama error"));
                }
                String token = event.path("message").path("content").asText("");
                if (!token.isEmpty()) {
                    onToken.accept(token);
                }
            }
        }
    }

    private LlmException mapHttpError(int statusCode, String body) {
        log.debug("Ollama API error {}: {}", statusCode, body);
        String message = switch (statusCode) {
            case 404 -> "Model not found. Pull it first with: ollama pull <model>";
            case 500, 502, 503 -> "Ollama server error. Check that the model is loaded.";
            default -> {
                try {
                    JsonNode error = objectMapper.readTree(body);
                    yield error.path("error").asText("Ollama request failed (HTTP " + statusCode + ")");
                } catch (IOException e) {
                    yield "Ollama request failed (HTTP " + statusCode + ")";
                }
            }
        };
        return new LlmException(message);
    }

    private static String stripTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
