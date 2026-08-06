import '../models/hotspot.dart';

class HotspotManager {
  final List<Hotspot> _hotspots = [];

  List<Hotspot> get hotspots => List.unmodifiable(_hotspots);

  void addHotspot(Hotspot hotspot) {
    _hotspots.add(hotspot);
  }

  void removeHotspot(String id) {
    _hotspots.removeWhere((h) => h.id == id);
  }

  Hotspot? getHotspotById(String id) {
    for (var hotspot in _hotspots) {
      if (hotspot.id == id) return hotspot;
    }
    return null;
  }

  /// Core recommendation feed: "famous hotspots near this location"
  List<Hotspot> getHotspotsForLocation(String locationId) =>
      _hotspots.where((h) => h.locationId == locationId).toList();

  List<Hotspot> getByType(String locationId, HotspotType type) => _hotspots
      .where((h) => h.locationId == locationId && h.type == type)
      .toList();
}
