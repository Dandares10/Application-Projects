import 'package:flutter/material.dart';
import 'package:registration_form/pages/signin.dart';
import 'package:registration_form/pages/signup.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreen();
}

class _OnboardingScreen extends State<OnboardingScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: EdgeInsets.only(top: 120),
        height: MediaQuery.of(context).size.height,
        width: MediaQuery.of(context).size.width,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xffb51837), Color(0xff661c3a), Color(0xff301939)],
            begin: Alignment.topLeft,
            end: Alignment.topRight,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              "images/dumbbells.png",
              color: Colors.white,
              height: 90,
              width: 90,
              fit: BoxFit.cover,
            ),
            Text(
              "Workout Tracker",
              style: TextStyle(color: Colors.white, fontSize: 30),
            ),
            SizedBox(height: 80),
            Text(
              "Welcome Back!",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 35,
              ),
            ),
            SizedBox(height: 40),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context)=> SignIn()
                )
                );
              },
              child: Container(
                padding: EdgeInsets.only(top: 8, bottom: 8),
                margin: EdgeInsets.only(left: 30, right: 30),
                width: MediaQuery.of(context).size.width,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white60, width: 2.0),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Center(
                  child: Text(
                    "SIGN IN",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                      fontSize: 25,
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(height: 40),
            GestureDetector(
              onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context)=> Signup()));
              },
              child: Container(
                padding: EdgeInsets.only(top: 8, bottom: 8),
                margin: EdgeInsets.only(left: 30, right: 30),
                width: MediaQuery.of(context).size.width,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white60, width: 2.0),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Center(
                  child: Text(
                    "SIGN UP",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                      fontSize: 25,
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).size.height / 8),
            Text(
              "Value",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w500,
                fontSize: 25,
              ),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.blueAccent,
                    borderRadius: BorderRadius.circular(60),
                  ),
                  child: Image.asset(
                    "images/social.png",
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  ),
                ),
                SizedBox(width: 20),
                Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.blueAccent,
                    borderRadius: BorderRadius.circular(60),
                  ),
                  child: Image.asset(
                    "images/instagram.png",
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  ),
                ),
                SizedBox(width: 20),
                Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.blueAccent,
                    borderRadius: BorderRadius.circular(60),
                  ),
                  child: Image.asset(
                    "images/google.png",
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
