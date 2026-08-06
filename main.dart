import 'package:flutter/material.dart';
import 'controllers/tour_controller.dart';
import 'screens/home_shell.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    // Obtain platform-specific options (may be null on native platforms).
    final firebaseOptions = DefaultFirebaseOptions.currentPlatform;
    if (firebaseOptions != null) {
      await Firebase.initializeApp(options: firebaseOptions);
    } else {
      debugPrint("Firebase initialized successfully.");
    }
  } catch (e) {
    // Graceful fallback if Firebase fails or is misconfigured
    debugPrint("Failed to initialize Firebase: $e");
  }

  runApp(const MyApp());
}
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final controller = TourController(); // Initialize the controller
    return MaterialApp(
      title: 'Tour App',
      theme: ThemeData(// where do I add the show debugbanner to be false
        primarySwatch: Colors.teal,
        useMaterial3: true, // Enable Material 3    
      ),
      debugShowCheckedModeBanner: false, // Hide the debug banner
      home: HomeShell(controller: controller), // Pass the controller to the screen
    );
  }
}


