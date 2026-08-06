import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/location.dart';
import '../models/review.dart';
import 'review_form_screen.dart';
import 'journey_post_form_screen.dart';
import 'hotspot_detail_screen.dart';

class LocationDetailScreen extends StatefulWidget {
  final TourController controller;
  final Location location;

  const LocationDetailScreen({
    super.key,
    required this.controller,
    required this.location,
  });

  @override
  State<LocationDetailScreen> createState() => _LocationDetailScreenState();
}

class _LocationDetailScreenState extends State<LocationDetailScreen> {
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
          targetId: widget.location.id,
          targetType: ReviewTargetType.location,
          targetName: widget.location.name,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = widget.location;
    final hotspots = _controller.getHotspotsFor(loc.id);
    final journeys = _controller.getJourneysFor(loc.id);
    final reviews = _controller.getReviewsFor(
      loc.id,
      ReviewTargetType.location,
    );

    return Scaffold(
      appBar: AppBar(title: Text(loc.name)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openReviewForm,
        icon: const Icon(Icons.rate_review),
        label: const Text('Write Review'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Image.network(
            loc.imageUrl,
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
          Text(loc.description, style: const TextStyle(fontSize: 15)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 20),
              Text(
                ' ${loc.averageRating.toStringAsFixed(1)} (${loc.reviewCount} reviews)',
              ),
            ],
          ),
          const Divider(height: 32),

          // --- Hotspots section ---
          const Text(
            'Famous Hotspots',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (hotspots.isEmpty)
            const Text(
              'No hotspots added yet',
              style: TextStyle(color: Colors.grey),
            )
          else
            ...hotspots.map(
              (h) => ListTile(
                leading: const Icon(Icons.place),
                title: Text(h.name),
                subtitle: Text('${h.type.name} · ${h.priceRange}'),
                trailing: Text('⭐ ${h.averageRating.toStringAsFixed(1)}'),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => HotspotDetailScreen(
                      controller: _controller,
                      hotspot: h,
                    ),
                  ),
                ),
              ),
            ),
          const Divider(height: 32),

          // --- Journey posts / hurdles section ---
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Traveler Journeys & Hurdles',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              TextButton.icon(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => JourneyPostFormScreen(
                      controller: _controller,
                      locationId: loc.id,
                      locationName: loc.name,
                    ),
                  ),
                ),
                icon: const Icon(Icons.edit_note),
                label: const Text('Share'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (journeys.isEmpty)
            const Text(
              'No journey posts yet',
              style: TextStyle(color: Colors.grey),
            )
          else
            ...journeys.map(
              (j) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        j.title,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'by ${j.authorName}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(j.summary),
                      if (j.hurdlesFaced.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          children: j.hurdlesFaced
                              .map(
                                (hurdle) => Chip(
                                  label: Text(
                                    hurdle,
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                  backgroundColor: Colors.red[50],
                                ),
                              )
                              .toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          const Divider(height: 32),

          // --- Reviews section ---
          const Text(
            'Reviews',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (reviews.isEmpty)
            const Text(
              'No reviews yet — be the first!',
              style: TextStyle(color: Colors.grey),
            )
          else
            ...reviews.map(
              (r) => ListTile(
                leading: const Icon(Icons.person),
                title: Text(r.authorName),
                subtitle: Text(r.comment),
                trailing: Text('⭐ ${r.rating.toStringAsFixed(1)}'),
              ),
            ),
          const SizedBox(height: 60), // spacing so FAB doesn't cover last item
        ],
      ),
    );
  }
}
