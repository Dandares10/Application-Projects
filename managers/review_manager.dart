import '../models/review.dart';
import '../models/location.dart';
import '../models/hotspot.dart';
import 'location_manager.dart';
import 'hotspot_manager.dart';

class ReviewManager {
  final List<Review> _reviews = [];
  final LocationManager locationManager;
  final HotspotManager hotspotManager;

  ReviewManager({required this.locationManager, required this.hotspotManager});

  List<Review> get reviews => List.unmodifiable(_reviews);

  /// Adds a review AND updates the target's average rating in one call,
  /// so the rest of the app never has to remember to do both.
  void addReview(Review review) {
    _reviews.add(review);

    if (review.targetType == ReviewTargetType.location) {
      final Future<Location?> location = locationManager.getLocationById(review.targetId);
      location.then((loc) => loc?.addRating(review.rating));
    } else {
      final Hotspot? hotspot = hotspotManager.getHotspotById(review.targetId);
      hotspot?.addRating(review.rating);
    }
  }

  void removeReview(String id) {
    final reviewToRemove = _reviews.cast<Review?>().firstWhere((r) => r?.id == id, orElse: () => null);
    if(reviewToRemove == null) return;
    _reviews.removeWhere((r) => r.id == id);
    // Recalculate average rating after removal
    final remainingReviews = getReviewsFor(reviewToRemove.targetId, reviewToRemove.targetType);
    final newAverage = remainingReviews.isNotEmpty
            ? remainingReviews.map((r) => r.rating).reduce((a, b) => a + b) / remainingReviews.length
            : 0.0;
    if(reviewToRemove.targetType == ReviewTargetType.location) {
      final Future<Location?> location = locationManager.getLocationById(reviewToRemove.targetId);
      location.then((loc) => loc?.updateAverageRating(newAverage, newCount: remainingReviews.length));
    } else {
      final Hotspot? hotspot = hotspotManager.getHotspotById(reviewToRemove.targetId);
      hotspot?.updateAverageRating(newAverage, newCount: remainingReviews.length);
    }
  }


  List<Review> getReviewsFor(String targetId, ReviewTargetType type) => _reviews
      .where((r) => r.targetId == targetId && r.targetType == type)
      .toList()
    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
}


