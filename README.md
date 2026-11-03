# Websites

This repository contains independent learning projects. Each project lives in its own directory; use the project-specific README for its requirements and setup.

## Projects on `main`

| Project | Namespace | Description |
|---|---|---|
| Flutter Login UI | [`flutter-login/`](./flutter-login/README.md) | Flutter screen prototypes for onboarding, sign-in, and sign-up. These are UI snippets, not a complete runnable Flutter app. |
| Taskfyer | [`taskfyer/`](./taskfyer/README.md) | Full-stack task manager with a Next.js client and Express/MongoDB backend. See its [setup guide](./taskfyer/SETUP_GUIDE.md). |

## Projects on other branches

- [Blog app (`Blog-app` branch)](https://github.com/Dandares10/Websites/tree/Blog-app) — contains the separate `blogapp.zip` project.

The former `task` and `Dandares10-taskapp` branches duplicated projects now organized on `main`, so they have been removed. The `Blog-app` branch is retained because it contains a separate blog project.

## Repository layout

```text
flutter-login/
  lib/pages/       Flutter screen prototypes
taskfyer/
  backend/         Express API and MongoDB models
  client/          Next.js web application
  SETUP_GUIDE.md   Taskfyer setup and API notes
```

There is no single build command for the whole repository. Follow the setup instructions for the project you want to run.
