/// Lightweight reference model. The full post (rich text, comments, likes)
/// lives in your blog app's backend. This model holds just what the tour
/// app needs to display a preview and link back to the location.
class JourneyPost {
  final String id;
  final String locationId; // which Location this journey is about
  final String authorId;
  final String authorName;
  final String title;
  final String summary; // short excerpt, not full blog content
  final List<String> hurdlesFaced; // e.g. ["Steep trail", "No signal zone"]
  final String coverImageUrl;
  final DateTime createdAt;
  final String blogPostUrl; // deep link / URL back to full post in blog app

  JourneyPost({
    required this.id,
    required this.locationId,
    required this.authorId,
    required this.authorName,
    required this.title,
    required this.summary,
    required this.hurdlesFaced,
    required this.coverImageUrl,
    required this.createdAt,
    required this.blogPostUrl,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'locationId': locationId,
        'authorId': authorId,
        'authorName': authorName,
        'title': title,
        'summary': summary,
        'hurdlesFaced': hurdlesFaced,
        'coverImageUrl': coverImageUrl,
        'createdAt': createdAt.toIso8601String(),
        'blogPostUrl': blogPostUrl,
      };

  factory JourneyPost.fromJson(Map<String, dynamic> json) => JourneyPost(
        id: json['id'] as String,
        locationId: json['locationId'] as String,
        authorId: json['authorId'] as String,
        authorName: json['authorName'] as String,
        title: json['title'] as String,
        summary: json['summary'] as String,
        hurdlesFaced: List<String>.from(json['hurdlesFaced'] as List? ?? []),
        coverImageUrl: json['coverImageUrl'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        blogPostUrl: json['blogPostUrl'] as String,
      );
}
