import 'package:flutter/material.dart';
import '../controllers/tour_controller.dart';
import '../models/location.dart';
import 'location_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final TourController controller;

  const SearchScreen({super.key, required this.controller});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchCtrl,
          autofocus: false,
          decoration: const InputDecoration(
            hintText: 'Search destinations or categories...',
            border: InputBorder.none,
          ),
          onChanged: (v) => setState(() => _query = v),
        ),
      ),
      body: StreamBuilder<List<Location>>(
        stream: widget.controller.streamLocations(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final all = snapshot.data ?? [];
          final results = _query.isEmpty
              ? all
              : all
                  .where((l) =>
                      l.name.toLowerCase().contains(_query.toLowerCase()) ||
                      l.category.toLowerCase().contains(_query.toLowerCase()))
                  .toList();

          if (results.isEmpty) {
            return const Center(child: Text('No matches found'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: results.length,
            itemBuilder: (ctx, i) {
              final loc = results[i];
              return ListTile(
                leading: const Icon(Icons.location_on),
                title: Text(loc.name),
                subtitle: Text(loc.category),
                trailing: Text('⭐ ${loc.averageRating.toStringAsFixed(1)}'),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LocationDetailScreen(
                      controller: widget.controller,
                      location: loc,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}