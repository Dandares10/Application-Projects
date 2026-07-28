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

class OllamaProviderTest {

    private HttpServer server;
    private String baseUrl;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        baseUrl = "http://localhost:" + server.getAddress().getPort();
        server.start();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    void createWithoutApiKey() {
        assertDoesNotThrow(() -> new OllamaProvider());
    }

    @Test
    void streamsTokensFromNdjsonResponse() {
        server.createContext("/api/chat", exchange -> {
            byte[] response = (
                    "{\"message\":{\"role\":\"assistant\",\"content\":\"Hello\"},\"done\":false}\n" +
                    "{\"message\":{\"role\":\"assistant\",\"content\":\" world\"},\"done\":true}\n"
            ).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/x-ndjson");
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        OllamaProvider provider = new OllamaProvider(baseUrl, HttpClient.newHttpClient());
        LlmRequest request = new LlmRequest(
                "You are a debugger",
                List.of(new LlmMessage("user", "analyze this code")),
                "llama3",
                1024
        );

        AtomicReference<String> result = new AtomicReference<>("");
        provider.analyzeStreaming(request, token -> result.updateAndGet(s -> s + token));

        assertEquals("Hello world", result.get());
    }

    @Test
    void throwsOn404() {
        server.createContext("/api/chat", exchange -> {
            byte[] body = "{\"error\":\"model not found\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(404, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });

        OllamaProvider provider = new OllamaProvider(baseUrl, HttpClient.newHttpClient());
        LlmRequest request = new LlmRequest(
                "system",
                List.of(new LlmMessage("user", "hi")),
                "missing-model",
                1024
        );

        LlmException ex = assertThrows(LlmException.class, () -> provider.analyze(request));
        assertTrue(ex.getMessage().contains("Model not found"));
    }
}
