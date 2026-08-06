import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/journey_post.dart';

class JourneyPostFormScreen extends StatefulWidget {
  final TourController controller;
  final String locationId;
  final String locationName;

  const JourneyPostFormScreen({
    super.key,
    required this.controller,
    required this.locationId,
    required this.locationName,
  });

  @override
  State<JourneyPostFormScreen> createState() => _JourneyPostFormScreenState();
}

class _JourneyPostFormScreenState extends State<JourneyPostFormScreen> {
  final _titleCtrl = TextEditingController();
  final _summaryCtrl = TextEditingController();
  final _nameCtrl = TextEditingController(); // temp until auth exists
  final _imageUrlCtrl = TextEditingController();
  final _blogUrlCtrl = TextEditingController();
  final _hurdleInputCtrl = TextEditingController();
  final List<String> _hurdles = [];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _summaryCtrl.dispose();
    _nameCtrl.dispose();
    _imageUrlCtrl.dispose();
    _blogUrlCtrl.dispose();
    _hurdleInputCtrl.dispose();
    super.dispose();
  }

  void _addHurdle() {
    final text = _hurdleInputCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _hurdles.add(text);
      _hurdleInputCtrl.clear();
    });
  }

  void _removeHurdle(int index) {
    setState(() => _hurdles.removeAt(index));
  }

  void _submit() {
    final title = _titleCtrl.text.trim();
    final summary = _summaryCtrl.text.trim();
    final name = _nameCtrl.text.trim();

    if (title.isEmpty || summary.isEmpty || name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in your name, title, and summary')),
      );
      return;
    }

    widget.controller.addJourneyPost(JourneyPost(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      locationId: widget.locationId,
      authorId: name.toLowerCase().replaceAll(' ', '_'), // temp id until auth
      authorName: name,
      title: title,
      summary: summary,
      hurdlesFaced: List.from(_hurdles),
      coverImageUrl: _imageUrlCtrl.text.trim().isEmpty
          ? 'https://picsum.photos/400/300?random=${DateTime.now().millisecondsSinceEpoch}'
          : _imageUrlCtrl.text.trim(),
      createdAt: DateTime.now(),
      blogPostUrl: _blogUrlCtrl.text.trim(),
    ));

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Share Journey: ${widget.locationName}')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(
              labelText: 'Your Name',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _titleCtrl,
            decoration: const InputDecoration(
              labelText: 'Journey Title',
              hintText: 'e.g. "3 days at Everest Base Camp"',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _summaryCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Summary',
              hintText: 'Short preview of your journey',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),

          const Text('Hurdles Faced', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text(
            'Add anything future travelers should know about',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _hurdleInputCtrl,
                  decoration: const InputDecoration(
                    hintText: 'e.g. "Steep final ascent"',
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => _addHurdle(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.add_circle, color: Colors.red),
                onPressed: _addHurdle,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: List.generate(_hurdles.length, (i) {
              return Chip(
                label: Text(_hurdles[i]),
                backgroundColor: Colors.red[50],
                onDeleted: () => _removeHurdle(i),
              );
            }),
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _imageUrlCtrl,
            decoration: const InputDecoration(
              labelText: 'Cover Image URL (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _blogUrlCtrl,
            decoration: const InputDecoration(
              labelText: 'Full Blog Post Link (optional)',
              hintText: 'Paste link to your full post on the blog app',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(14)),
              child: const Text('Post Journey'),
            ),
          ),
        ],
      ),
    );
  }
}