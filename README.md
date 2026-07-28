# CodeMedic

AI-powered debugging agent for your codebase. CodeMedic reads your source files, builds a focused debugging context, queries a local or hosted LLM, and streams analysis and suggested fixes back to your terminal.

## Requirements

- Java 21+
- One of the supported LLM providers (Ollama is the default and recommended):
  - Ollama (default, local) — https://ollama.com
  - Anthropic (optional) — requires an API key and may incur usage costs

## Quick Start

Notes: examples are shown for Unix-like shells (bash/zsh). Windows PowerShell examples are provided where different.

Build:

Unix / macOS / WSL

```bash
./gradlew build
```

Windows (PowerShell)

```powershell
.\gradlew.bat build
```

Run the analyzer (default provider: Ollama with model `llama3` on localhost:11434):

Unix

```bash
./gradlew run --args="analyze src/Main.java"
```

Windows (PowerShell)

```powershell
.\gradlew.bat run --args="analyze src\Main.java"
```

Using Ollama (recommended local workflow)

- Install Ollama from https://ollama.com and follow setup instructions.
- Pull the model you plan to use (example):

```bash
ollama pull llama3
```

- Ensure the Ollama daemon is running and reachable (default: http://localhost:11434). If the daemon is on a different host/port, update `codemedic.llm.ollama.base-url`.

Switch provider (examples)

Set provider to Ollama (explicit):

Unix

```bash
./gradlew run --args="config set codemedic.llm.provider ollama"
./gradlew run --args="config set codemedic.llm.model llama3"
```

Windows (PowerShell)

```powershell
.\gradlew.bat run --args="config set codemedic.llm.provider ollama"
.\gradlew.bat run --args="config set codemedic.llm.model llama3"
```

Set provider to Anthropic (optional):

Unix

```bash
./gradlew run --args="config set codemedic.llm.provider anthropic"
./gradlew run --args="config set-key sk-ant-your-key-here"
```

Windows (PowerShell)

```powershell
.\gradlew.bat run --args="config set codemedic.llm.provider anthropic"
.\gradlew.bat run --args="config set-key sk-ant-your-key-here"
```

Interactive chat (attach a file to the session):

Unix

```bash
./gradlew run --args="chat --file src/Main.java"
```

Windows (PowerShell)

```powershell
.\gradlew.bat run --args="chat --file src\Main.java"
```

Install a distribution:

Unix

```bash
./gradlew installDist
~/.codemedic/install/codemedic/bin/codemedic --help
```

Windows (PowerShell)

```powershell
.\gradlew.bat installDist
.\build\install\codemedic\bin\codemedic.bat --help
```

Example: expected analyzer output (truncated)

```
Analyzing 12 files for 'null pointer' (depth=3)...
[INFO] src/main/java/com/example/App.java: Possible null dereference at line 72
  - Reason: return value of parseConfig() may be null when config missing
  - Suggestion: add null-check or provide default
Analysis complete. 3 issues found.
```

## Commands

| Command | Description |
|---------|-------------|
| `codemedic analyze <path>` | Analyze a file or directory for bugs and risky patterns |
| `codemedic chat [--file <path>]` | Interactive debugging chat session (adds files to context) |
| `codemedic config set-key <key>` | Save an API key to `~/.codemedic/config` (encrypted where available) |
| `codemedic config show` | Show current configuration (user overrides) |
| `codemedic config set <key> <value>` | Set any config value (namespaced like `codemedic.llm.model`) |

### Analyze Options

```bash
codemedic analyze src/ --focus "null pointer" --depth 5
codemedic analyze "**/*.java" -f "memory leak"
```

Options summary:
- --focus / -f: provide a short natural-language focus for the analysis
- --depth / -d: how deep to traverse call stacks and inter-file contexts (higher is slower)

### Chat Commands

Inside an interactive chat session:

- `/file <path>` — Add a file to context
- `/files` — List files currently in context
- `/clear` — Clear conversation and loaded files from the session
- `/help` — Show available chat commands
- `/exit` — End session

## Configuration

Defaults live in `src/main/resources/application.conf`. User overrides are saved to `~/.codemedic/config` (in the user's home directory).

Common keys and defaults:

| Key | Default | Description |
|-----|---------|-------------|
| `codemedic.llm.provider` | `ollama` | LLM provider to use. Either `ollama` (local) or `anthropic` (API). |
| `codemedic.llm.model` | `llama3` | Model name to request from the provider |
| `codemedic.llm.ollama.base-url` | `http://localhost:11434` | Ollama server URL (when using Ollama) |
| `codemedic.llm.api-key` | (env) `ANTHROPIC_API_KEY` | Anthropic API key (only used when provider is `anthropic`) |
| `codemedic.llm.max-tokens` | `4096` | Maximum response tokens to request |
| `codemedic.debug.verbose` | `false` | Set to `true` for more verbose logs |

Environment variables:
- ANTHROPIC_API_KEY — alternative to `config set-key` for Anthropic

Provider notes:
- Ollama: run `ollama pull llama3` to download the model locally. Ensure the Ollama daemon is running and reachable at the configured base URL.
- Anthropic: set `codemedic.llm.provider` to `anthropic` and provide an API key via `codemedic config set-key` or the `ANTHROPIC_API_KEY` environment variable.

## Development

Run tests and build locally:

```bash
./gradlew test
./gradlew build
./gradlew fatJar
```

Tips:
- Use `--stacktrace` or `--info` with Gradle for more diagnostic output
- Tests are run automatically as part of `./gradlew build`

## Architecture

```
CLI (Picocli) → Core (FileLoader, ContextBuilder, DebugSession)
              → LLM (LlmProviderFactory → OllamaProvider / AnthropicProvider)
              → Output (TerminalRenderer)
```

Switch providers via config (no code changes required):

```bash
codemedic config set codemedic.llm.provider ollama
codemedic config set codemedic.llm.model llama3
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Open an issue describing the bug or feature.
2. Fork the repository and create a feature branch: `git checkout -b fix/your-change`
3. Run and update tests. Make small, focused commits.
4. Submit a pull request with a clear description and, where applicable, test coverage.

Coding style:
- Follow existing project conventions. Prefer small, testable changes.

## Troubleshooting

- "Model not reachable" (Ollama): verify Ollama is running and `codemedic.llm.ollama.base-url` is correct. Try `curl http://localhost:11434`.
- "API key not provided" (Anthropic): set `ANTHROPIC_API_KEY` or use `codemedic config set-key <key>`.
- Gradle permission or execution errors on Windows: use PowerShell and run `.\gradlew.bat` instead of `./gradlew`.

If problems persist, run with `--debug`/`--info` and open an issue with the command output.

## License

SPDX-License-Identifier: MIT

Copyright (c) 2024 CodeMedic contributors
