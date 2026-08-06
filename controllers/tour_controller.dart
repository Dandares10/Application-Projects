import 'package:flutter/foundation.dart';
import '../models/location.dart';
import '../models/hotspot.dart';
import '../models/journey_post.dart';
import '../models/review.dart';
import '../managers/location_manager.dart';
import '../managers/hotspot_manager.dart';
import '../managers/journey_post_manager.dart';
import '../managers/review_manager.dart';

class TourController extends ChangeNotifier {
  final LocationManager locationManager = LocationManager();
  final HotspotManager hotspotManager = HotspotManager();
  final JourneyPostManager journeyPostManager = JourneyPostManager();
  late final ReviewManager reviewManager;

  TourController() {
    reviewManager = ReviewManager(
      locationManager: locationManager,
      hotspotManager: hotspotManager,
    );
  }

  Future<void> addLocation(Location location) async {
    await locationManager.addLocation(location);
    // No notifyListeners() needed here — the stream picks up the change automatically.
  }

  Stream<List<Location>> streamLocations() => locationManager.streamLocations();

  List<Location> getRecommendedLocations(List<Location> allLocations,
      {int limit = 10, String? preferredCategory}) {
    return locationManager.getRecommended(allLocations, limit: limit, preferredCategory: preferredCategory);
  }

  void addHotspot(Hotspot hotspot) {
    hotspotManager.addHotspot(hotspot);
    notifyListeners();
  }

  List<Hotspot> getHotspotsFor(String locationId) {
    return hotspotManager.getHotspotsForLocation(locationId);
  }

  void addJourneyPost(JourneyPost post) {
    journeyPostManager.addPost(post);
    notifyListeners();
  }

  List<JourneyPost> getJourneysFor(String locationId) {
    return journeyPostManager.getPostsForLocation(locationId);
  }

  void addReview(Review review) {
    reviewManager.addReview(review);
    notifyListeners();
  }

  List<Review> getReviewsFor(String targetId, ReviewTargetType type) {
    return reviewManager.getReviewsFor(targetId, type);
  }
}