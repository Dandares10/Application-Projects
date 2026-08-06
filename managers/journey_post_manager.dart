import '../models/journey_post.dart';

class JourneyPostManager {
  final List<JourneyPost> _posts = [];

  List<JourneyPost> get posts => List.unmodifiable(_posts);

  void addPost(JourneyPost post) {
    _posts.add(post);
  }

  void removePost(String id) {
    _posts.removeWhere((p) => p.id == id);
  }

  /// Shows journeys/hurdles other travelers faced at this location —
  /// this is what powers your "know before you go" feature.
  List<JourneyPost> getPostsForLocation(String locationId) => _posts
      .where((p) => p.locationId == locationId)
      .toList()
    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
}
