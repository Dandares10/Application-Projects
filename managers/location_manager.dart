import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/location.dart';

class LocationManager {
  final CollectionReference _collection =
      FirebaseFirestore.instance.collection('locations');

  /// Live stream of all locations — screens using this auto-update
  /// whenever Firestore data changes, no manual refresh needed.
  Stream<List<Location>> streamLocations() {
    return _collection.snapshots().map((snapshot) => snapshot.docs
        .map((doc) => Location.fromJson(doc.data() as Map<String, dynamic>))
        .toList());
  }

  Future<void> addLocation(Location location) async {
    await _collection.doc(location.id).set(location.toJson());
  }

  Future<void> removeLocation(String id) async {
    await _collection.doc(id).delete();
  }

  Future<Location?> getLocationById(String id) async {
    final doc = await _collection.doc(id).get();
    if (!doc.exists) return null;
    return Location.fromJson(doc.data() as Map<String, dynamic>);
  }

  /// Weighted recommendation score (same logic as before), now taking
  /// a list already fetched from the stream rather than an internal list.
  List<Location> getRecommended(List<Location> allLocations,
      {int limit = 10, String? preferredCategory}) {
    if (allLocations.isEmpty) return [];

    final ratedLocations = allLocations.where((l) => l.reviewCount > 0).toList();
    final double globalMeanRating = ratedLocations.isEmpty
        ? 0.0
        : ratedLocations.map((l) => l.averageRating).reduce((a, b) => a + b) /
            ratedLocations.length;

    const int minVotesThreshold = 5;

    double weightedScore(Location loc) {
      final v = loc.reviewCount;
      final r = loc.averageRating;
      final score = (v / (v + minVotesThreshold)) * r +
          (minVotesThreshold / (v + minVotesThreshold)) * globalMeanRating;
      final categoryBoost =
          (preferredCategory != null && loc.category == preferredCategory) ? 0.3 : 0.0;
      return score + categoryBoost;
    }

    final sorted = List<Location>.from(allLocations);
    sorted.sort((a, b) => weightedScore(b).compareTo(weightedScore(a)));
    return sorted.take(limit).toList();
  }
}