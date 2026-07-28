package dev.codemedic.config;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

public class AppConfig {

    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);
    private static final String CONFIG_DIR = ".codemedic";
    private static final String CONFIG_FILE = "config";

    private final Config config;
    private final Path userConfigPath;

    public AppConfig() {
        this.userConfigPath = Path.of(System.getProperty("user.home"), CONFIG_DIR, CONFIG_FILE);
        this.config = loadConfig();
    }

    public AppConfig(Config config, Path userConfigPath) {
        this.config = config;
        this.userConfigPath = userConfigPath;
    }

    public String getApiKey() {
        if(!config.hasPath("codemedic.llm.api-key")){
            return null;
        }
        String key = config.getString("codemedic.llm.api-key");
        return key.isBlank() ? null : key;
    }

    public String getModel() {
        return config.getString("codemedic.llm.model");
    }

    public String getProvider() {
        return config.getString("codemedic.llm.provider");
    }

    public String getOllamaBaseUrl() {
        if (config.hasPath("codemedic.llm.ollama.base-url")) {
            return config.getString("codemedic.llm.ollama.base-url");
        }
        return "http://localhost:11434";
    }

    public int getMaxTokens() {
        return config.getInt("codemedic.llm.max-tokens");
    }

    public boolean isVerbose() {
        return config.getBoolean("codemedic.debug.verbose");
    }

    public void setApiKey(String apiKey) throws IOException {
        setValue("codemedic.llm.api-key", apiKey);
    }

    public void setValue(String key, String value) throws IOException {
        Map<String, String> props = readUserConfig();
        props.put(key, value);
        writeUserConfig(props);
    }

    public Map<String, String> getDisplayConfig() {
        Map<String, String> display = new LinkedHashMap<>();
        display.put("codemedic.llm.provider", getProvider());
        display.put("codemedic.llm.model", getModel());
        if ("ollama".equalsIgnoreCase(getProvider())) {
            display.put("codemedic.llm.ollama.base-url", getOllamaBaseUrl());
        }
        display.put("codemedic.llm.api-key", maskApiKey(getApiKey()));
        display.put("codemedic.llm.max-tokens", String.valueOf(getMaxTokens()));
        display.put("codemedic.debug.verbose", String.valueOf(isVerbose()));
        display.put("config.file", userConfigPath.toString());
        return display;
    }

    public static String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return "(not set)";
        }
        if (apiKey.length() <= 8) {
            return "****";
        }
        return apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length() - 4);
    }

    private Config loadConfig() {
        Config defaults = ConfigFactory.load("application.conf");
        if (Files.exists(userConfigPath)) {
            Properties props = new Properties();
            try (var in = Files.newInputStream(userConfigPath)) {
                props.load(in);
            } catch (IOException e) {
                log.warn("Could not read user config: {}", e.getMessage());
            }
            Config userConfig = ConfigFactory.parseProperties(props);
            return userConfig.withFallback(defaults).resolve();
        }
        return defaults.resolve();
    }

    private Map<String, String> readUserConfig() throws IOException {
        Map<String, String> map = new LinkedHashMap<>();
        if (!Files.exists(userConfigPath)) {
            return map;
        }
        Properties props = new Properties();
        try (var in = Files.newInputStream(userConfigPath)) {
            props.load(in);
        }
        for (String name : props.stringPropertyNames()) {
            map.put(name, props.getProperty(name));
        }
        return map;
    }

    private void writeUserConfig(Map<String, String> props) throws IOException {
        Files.createDirectories(userConfigPath.getParent());
        Properties properties = new Properties();
        properties.putAll(props);
        try (var out = Files.newOutputStream(userConfigPath)) {
            properties.store(out, "CodeMedic user configuration");
        }
        log.info("Configuration saved to {}", userConfigPath);
    }

    Config reload() {
        return loadConfig();
    }
}
