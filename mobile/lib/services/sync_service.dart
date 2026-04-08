import 'dart:convert';
import 'dart:io';
import 'package:hive_flutter/hive_flutter.dart';
import 'api_service.dart';

class SyncService {
  final ApiService _apiService = ApiService();
  final String _boxName = 'offline_reports_queue';
  
  static final SyncService _instance = SyncService._internal();

  factory SyncService() {
    return _instance;
  }

  SyncService._internal();

  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox<String>(_boxName);
    await Hive.openBox('unit_cache');
  }

  Box<String> get offlineBox => Hive.box<String>(_boxName);
  int get pendingCount => offlineBox.length;

  Future<bool> hasInternet() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
    } on SocketException catch (_) {
      return false;
    }
    return false;
  }

  Future<void> queueReport(String endpoint, Map<String, dynamic> data) async {
    final box = Hive.box<String>(_boxName);
    
    final payload = {
      'endpoint': endpoint,
      'data': data,
      'timestamp': DateTime.now().toIso8601String()
    };
    
    await box.add(jsonEncode(payload));
    
    // Attempt to sync immediately if internet is available
    if (await hasInternet()) {
      await syncPendingReports();
    }
  }

  Future<void> syncPendingReports() async {
    final box = Hive.box<String>(_boxName);
    
    if (box.isEmpty) return;

    List<int> keysToRemove = [];

    for (var key in box.keys) {
      final item = box.get(key);
      if (item != null) {
        final payload = jsonDecode(item);
        final endpoint = payload['endpoint'];
        final data = payload['data'];

        try {
          final response = await _apiService.client.post(endpoint, data: data);
          if (response.statusCode == 200 || response.statusCode == 201) {
             keysToRemove.add(key);
          }
        } catch (e) {
          print("Failed to sync item $key: $e");
          // Leave it in the queue for next retry
        }
      }
    }

    // Clean up successful syncs
    for (var key in keysToRemove) {
      await box.delete(key);
    }
  }
}
