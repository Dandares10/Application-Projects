package dev.codemedic.core;

import java.nio.file.Path;

public record CodeFile(Path path, String language, String content, int lineCount) {
}
