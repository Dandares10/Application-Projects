package dev.codemedic.llm;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class AnthropicProviderTest {

    private HttpServer server;
    private String baseUrl;
    private int port;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        port = server.getAddress().getPort();
        baseUrl = "http://localhost:" + port;
        server.start();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    void streamsTokensFromSseResponse() {
        server.createContext("/v1/messages", exchange -> {
            byte[] response = (
                    "data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"Hello\"}}\n\n" +
                    "data: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\" world\"}}\n\n" +
                    "data: {\"type\":\"message_stop\"}\n\n"
            ).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        TestableAnthropicProvider provider = new TestableAnthropicProvider("test-key", baseUrl);
        LlmRequest request = new LlmRequest(
                "system",
                List.of(new LlmMessage("user", "hi")),
                "claude-sonnet-4-20250514",
                1024
        );

        AtomicReference<String> result = new AtomicReference<>("");
        provider.analyzeStreaming(request, token -> result.updateAndGet(s -> s + token));

        assertEquals("Hello world", result.get());
    }

    @Test
    void throwsOn401() {
        server.createContext("/v1/messages", exchange -> {
            byte[] body = "{\"error\":{\"message\":\"invalid key\"}}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(401, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });

        TestableAnthropicProvider provider = new TestableAnthropicProvider("bad-key", baseUrl);
        LlmRequest request = new LlmRequest(
                "system",
                List.of(new LlmMessage("user", "hi")),
                "claude-sonnet-4-20250514",
                1024
        );

        LlmException ex = assertThrows(LlmException.class, () -> provider.analyze(request));
        assertTrue(ex.getMessage().contains("401") || ex.getMessage().contains("invalid key"));
    }

    @Test
    void requiresApiKey() {
        assertThrows(IllegalArgumentException.class, () -> new AnthropicProvider(null));
        assertThrows(IllegalArgumentException.class, () -> new AnthropicProvider("  "));
    }

    /**
     * Test subclass that redirects API calls to a local mock server.
     */
    static class TestableAnthropicProvider extends AnthropicProvider {
        private final String baseUrl;

        TestableAnthropicProvider(String apiKey, String baseUrl) {
            super(apiKey, HttpClient.newHttpClient());
            this.baseUrl = baseUrl;
        }

        @Override
        public void analyzeStreaming(LlmRequest request, java.util.function.Consumer<String> onToken) {
            try {
                var body = new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode();
                body.put("model", request.model());
                body.put("max_tokens", request.maxTokens());
                body.put("stream", true);
                body.put("system", request.systemPrompt());
                var messages = body.putArray("messages");
                for (LlmMessage msg : request.messages()) {
                    var m = messages.addObject();
                    m.put("role", msg.role());
                    m.put("content", msg.content());
                }

                var httpRequest = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(baseUrl + "/v1/messages"))
                        .header("x-api-key", "test-key")
                        .header("anthropic-version", "2023-06-01")
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(
                                new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body)))
                        .build();

                var response = java.net.http.HttpClient.newHttpClient()
                        .send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofInputStream());

                if (response.statusCode() != 200) {
                    String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    throw new LlmException("HTTP " + response.statusCode() + ": " + errorBody);
                }

                try (var reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6);
                            var event = new com.fasterxml.jackson.databind.ObjectMapper().readTree(data);
                            if ("content_block_delta".equals(event.path("type").asText())) {
                                String text = event.path("delta").path("text").asText("");
                                if (!text.isEmpty()) {
                                    onToken.accept(text);
                                }
                            }
                        }
                    }
                }
            } catch (LlmException e) {
                throw e;
            } catch (Exception e) {
                throw new LlmException("Test error: " + e.getMessage(), e);
            }
        }
    }
}
