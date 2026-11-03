# Tour Recommender

An early Flutter prototype for browsing recommended tour locations, hotspot details, reviews, and journey posts.

## Current state

This branch contains Dart screens, models, managers, and Android platform files. It is an incomplete source snapshot, not yet a clone-and-run Flutter app: a `pubspec.yaml` and the standard Flutter project scaffolding are missing.

The Android `google-services.json` is project-specific Firebase client configuration. Review API-key restrictions and Firebase security rules before using the associated Firebase project.

## Next steps

1. Restore or create the Flutter package manifest and declare the required dependencies.
2. Generate the missing platform scaffolding with Flutter and verify the Android application ID and Firebase configuration.
3. Run `flutter pub get`, `flutter analyze`, and the project tests after the app is complete.

Do not commit machine-specific files such as `android/local.properties`; Flutter and the Android build tools generate those for each developer's environment.
