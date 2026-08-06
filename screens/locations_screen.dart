import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/location.dart';
import 'location_detail_screen.dart';

class LocationsScreen extends StatefulWidget {
  final TourController controller;

  const LocationsScreen({super.key, required this.controller});

  @override
  State<LocationsScreen> createState() => _LocationsScreenState();
}

class _LocationsScreenState extends State<LocationsScreen> {
  late TourController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller;
  }

  // One-time seed: tap the button in the app bar to push sample
  // locations into Firestore. Remove this once real data exists.
  Future<void> _seedSampleData() async {
    await _controller.addLocation(Location(
      id: 'loc1',
      name: 'Everest Base Camp',
      description: 'High-altitude trek with breathtaking Himalayan views.',
      imageUrl: 'https://picsum.photos/400/300?1',
      category: 'Mountain',
      latitude: 28.0026,
      longitude: 86.8528,
      difficulty: DifficultyLevel.dangerous,
    ));

    await _controller.addLocation(Location(
      id: 'loc2',
      name: 'Bali Beaches',
      description: 'Relaxed coastal getaway with vibrant local culture.',
      imageUrl: 'https://picsum.photos/400/300?2',
      category: 'Beach',
      latitude: -8.3405,
      longitude: 115.0920,
      difficulty: DifficultyLevel.easy,
    ));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sample data seeded to Firestore')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore Destinations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_upload),
            tooltip: 'Seed sample data (temporary)',
            onPressed: _seedSampleData,
          ),
        ],
      ),
      body: StreamBuilder<List<Location>>(
        stream: _controller.streamLocations(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final locations = snapshot.data ?? [];
          if (locations.isEmpty) {
            return const Center(
              child: Text('No destinations yet — tap the cloud icon above to seed sample data'),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: locations.length,
            itemBuilder: (ctx, i) {
              final loc = locations[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LocationDetailScreen(controller: _controller, location: loc),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Image.network(
                        loc.imageUrl,
                        height: 160,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          height: 160,
                          color: Colors.grey[300],
                          child: const Icon(Icons.image_not_supported),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(loc.name,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text(loc.description, style: const TextStyle(color: Colors.grey)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _buildDifficultyBadge(loc.difficulty),
                                const Spacer(),
                                const Icon(Icons.star, color: Colors.amber, size: 18),
                                Text(' ${loc.averageRating.toStringAsFixed(1)} (${loc.reviewCount})'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildDifficultyBadge(DifficultyLevel level) {
    final colors = {
      DifficultyLevel.easy: Colors.green,
      DifficultyLevel.moderate: Colors.orange,
      DifficultyLevel.hard: Colors.deepOrange,
      DifficultyLevel.dangerous: Colors.red,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: colors[level]!.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors[level]!),
      ),
      child: Text(
        level.name.toUpperCase(),
        style: TextStyle(color: colors[level], fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }
}