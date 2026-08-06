enum ReviewTargetType { location, hotspot }

ReviewTargetType reviewTargetFromString(String value) {
  return ReviewTargetType.values.firstWhere(
    (e) => e.name == value,
    orElse: () => ReviewTargetType.location,
  );
}

class Review {
  final String id;
  final String targetId; // Location.id or Hotspot.id
  final ReviewTargetType targetType;
  final String authorId;
  final String authorName;
  final double rating; // 1.0 - 5.0
  final String comment;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.targetId,
    required this.targetType,
    required this.authorId,
    required this.authorName,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'targetId': targetId,
        'targetType': targetType.name,
        'authorId': authorId,
        'authorName': authorName,
        'rating': rating,
        'comment': comment,
        'createdAt': createdAt.toIso8601String(),
      };

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json['id'] as String,
        targetId: json['targetId'] as String,
        targetType: reviewTargetFromString(json['targetType'] as String? ?? 'location'),
        authorId: json['authorId'] as String,
        authorName: json['authorName'] as String,
        rating: (json['rating'] as num).toDouble(),
        comment: json['comment'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}
