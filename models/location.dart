enum DifficultyLevel { easy, moderate, hard, dangerous }

DifficultyLevel difficultyFromString(String value) {
  return DifficultyLevel.values.firstWhere(
    (e) => e.name == value,
    orElse: () => DifficultyLevel.moderate,
  );
}

class Location {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String category; // e.g. "Mountain", "Beach", "Historical"
  final double latitude;
  final double longitude;
  final DifficultyLevel difficulty;
  double averageRating;
  int reviewCount;

  Location({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.latitude,
    required this.longitude,
    this.difficulty = DifficultyLevel.moderate,
    this.averageRating = 0.0,
    this.reviewCount = 0,
  });

  /// Recalculates average rating when a new rating comes in.
  void addRating(double newRating) {
    final totalScore = averageRating * reviewCount;
    reviewCount += 1;
    averageRating = (totalScore + newRating) / reviewCount;
  }
  void updateAverageRating(double newAverage, {int? newCount}) {
    averageRating = newAverage;
    if (newCount != null) {
      reviewCount = newCount;
    }
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'imageUrl': imageUrl,
        'category': category,
        'latitude': latitude,
        'longitude': longitude,
        'difficulty': difficulty.name,
        'averageRating': averageRating,
        'reviewCount': reviewCount,
      };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        imageUrl: json['imageUrl'] as String,
        category: json['category'] as String,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        difficulty: difficultyFromString(json['difficulty'] as String? ?? 'moderate'),
        averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
        reviewCount: json['reviewCount'] as int? ?? 0,
      );
}
