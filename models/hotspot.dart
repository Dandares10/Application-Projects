enum HotspotType { viewpoint, stall, restaurant, hotel, activity }

HotspotType hotspotTypeFromString(String value) {
  return HotspotType.values.firstWhere(
    (e) => e.name == value,
    orElse: () => HotspotType.viewpoint,
  );
}

class Hotspot {
  final String id;
  final String locationId; // links back to Location.id
  final String name;
  final HotspotType type;
  final String description;
  final String imageUrl;
  final double latitude;
  final double longitude;
  final String priceRange; // e.g. "$", "$$", "Free"
  double averageRating;
  int reviewCount;

  Hotspot({
    required this.id,
    required this.locationId,
    required this.name,
    required this.type,
    required this.description,
    required this.imageUrl,
    required this.latitude,
    required this.longitude,
    this.priceRange = 'Free',
    this.averageRating = 0.0,
    this.reviewCount = 0,
  });

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
        'locationId': locationId,
        'name': name,
        'type': type.name,
        'description': description,
        'imageUrl': imageUrl,
        'latitude': latitude,
        'longitude': longitude,
        'priceRange': priceRange,
        'averageRating': averageRating,
        'reviewCount': reviewCount,
      };

  factory Hotspot.fromJson(Map<String, dynamic> json) => Hotspot(
        id: json['id'] as String,
        locationId: json['locationId'] as String,
        name: json['name'] as String,
        type: hotspotTypeFromString(json['type'] as String? ?? 'viewpoint'),
        description: json['description'] as String,
        imageUrl: json['imageUrl'] as String,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        priceRange: json['priceRange'] as String? ?? 'Free',
        averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
        reviewCount: json['reviewCount'] as int? ?? 0,
      );
}
