import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/review.dart';

class ReviewFormScreen extends StatefulWidget {
  final TourController controller;
  final String targetId;
  final ReviewTargetType targetType;
  final String targetName; // for display in the app bar

  const ReviewFormScreen({
    super.key,
    required this.controller,
    required this.targetId,
    required this.targetType,
    required this.targetName,
  });

  @override
  State<ReviewFormScreen> createState() => _ReviewFormScreenState();
}

class _ReviewFormScreenState extends State<ReviewFormScreen> {
  double _rating = 3.0;
  final _commentCtrl = TextEditingController();
  final _nameCtrl = TextEditingController(); // temp until user auth exists

  @override
  void dispose() {
    _commentCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final name = _nameCtrl.text.trim();
    final comment = _commentCtrl.text.trim();

    if (name.isEmpty || comment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in your name and comment')),
      );
      return;
    }

    widget.controller.addReview(Review(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      targetId: widget.targetId,
      targetType: widget.targetType,
      authorId: name.toLowerCase().replaceAll(' ', '_'), // temp id until auth
      authorName: name,
      rating: _rating,
      comment: comment,
      createdAt: DateTime.now(),
    ));

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Review: ${widget.targetName}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Your rating', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (i) {
                final starValue = i + 1;
                return IconButton(
                  icon: Icon(
                    starValue <= _rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 32,
                  ),
                  onPressed: () => setState(() => _rating = starValue.toDouble()),
                );
              }),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Your Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _commentCtrl,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Share your experience',
                hintText: 'Was it worth it? Any hurdles others should know about?',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(14)),
                child: const Text('Submit Review'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}