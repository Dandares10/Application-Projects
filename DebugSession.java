package dev.codemedic.core;

import dev.codemedic.llm.LlmMessage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DebugSession {

    private final List<LlmMessage> messages = new ArrayList<>();
    private final Map<String, CodeFile> contextFiles = new LinkedHashMap<>();
    private boolean contextSent;

    public void addUserMessage(String content) {
        messages.add(new LlmMessage("user", content));
    }

    public void addAssistantMessage(String content) {
        messages.add(new LlmMessage("assistant", content));
    }

    public List<LlmMessage> getMessages() {
        return Collections.unmodifiableList(messages);
    }

    public void addFile(CodeFile file) {
        contextFiles.put(file.path().toString(), file);
        contextSent = false;
    }

    public void addFiles(List<CodeFile> files) {
        for (CodeFile file : files) {
            addFile(file);
        }
    }

    public List<CodeFile> getContextFiles() {
        return List.copyOf(contextFiles.values());
    }

    public boolean hasContextFiles() {
        return !contextFiles.isEmpty();
    }

    public boolean isContextSent() {
        return contextSent;
    }

    public void markContextSent() {
        contextSent = true;
    }

    public void clear() {
        messages.clear();
        contextFiles.clear();
        contextSent = false;
    }

    public void clearMessages() {
        messages.clear();
        contextSent = false;
    }
}
