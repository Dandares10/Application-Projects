package dev.codemedic.llm;

import com.typesafe.config.ConfigFactory;
import dev.codemedic.config.AppConfig;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class LlmProviderFactoryTest {

    @Test
    void createsOllamaProvider() {
        var config = ConfigFactory.parseString("""
                codemedic.llm.provider = ollama
                codemedic.llm.model = llama3
                codemedic.llm.max-tokens = 1024
                codemedic.llm.ollama.base-url = "http://localhost:11434"
                codemedic.debug.verbose = false
                """).resolve();
        AppConfig appConfig = new AppConfig(config, Path.of("unused"));

        LlmProvider provider = LlmProviderFactory.create(appConfig);

        assertInstanceOf(OllamaProvider.class, provider);
    }

    @Test
    void throwsForUnknownProvider() {
        var config = ConfigFactory.parseString(
                "codemedic.llm.provider = unknown"
        ).resolve();
        AppConfig appConfig = new AppConfig(config, Path.of("unused"));

        assertThrows(LlmException.class, () -> LlmProviderFactory.create(appConfig));
    }
}
