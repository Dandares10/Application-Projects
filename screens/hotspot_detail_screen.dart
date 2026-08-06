import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/hotspot.dart';
import '../models/review.dart';
import 'review_form_screen.dart';

class HotspotDetailScreen extends StatefulWidget {
  final TourController controller;
  final Hotspot hotspot;

  const HotspotDetailScreen({
    super.key,
    required this.controller,
    required this.hotspot,
  });

  @override
  State<HotspotDetailScreen> createState() => _HotspotDetailScreenState();
}

class _HotspotDetailScreenState extends State<HotspotDetailScreen> {
  late TourController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller;
    _controller.addListener(_onDataChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onDataChanged);
    super.dispose();
  }

  void _onDataChanged() => setState(() {});

  void _openReviewForm() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReviewFormScreen(
          controller: _controller,
          targetId: widget.hotspot.id,
          targetType: ReviewTargetType.hotspot,
          targetName: widget.hotspot.name,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final spot = widget.hotspot;
    final reviews = _controller.getReviewsFor(spot.id, ReviewTargetType.hotspot);

    return Scaffold(
      appBar: AppBar(title: Text(spot.name)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openReviewForm,
        icon: const Icon(Icons.rate_review),
        label: const Text('Write Review'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Image.network(
            spot.imageUrl,
            height: 200,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (ctx, err, stack) => Container(
              height: 200,
              color: Colors.grey[300],
              child: const Icon(Icons.image_not_supported),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Chip(label: Text(spot.type.name)),
              const SizedBox(width: 8),
              Chip(label: Text(spot.priceRange)),
            ],
          ),
          const SizedBox(height: 8),
          Text(spot.description, style: const TextStyle(fontSize: 15)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 20),
              Text(' ${spot.averageRating.toStringAsFixed(1)} (${spot.reviewCount} reviews)'),
            ],
          ),
          const Divider(height: 32),
          const Text('Reviews', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (reviews.isEmpty)
            const Text('No reviews yet — be the first!', style: TextStyle(color: Colors.grey))
          else
            ...reviews.map((r) => ListTile(
                  leading: const Icon(Icons.person),
                  title: Text(r.authorName),
                  subtitle: Text(r.comment),
                  trailing: Text('⭐ ${r.rating.toStringAsFixed(1)}'),
                )),
          const SizedBox(height: 60),
        ],
      ),
    );
  }
}