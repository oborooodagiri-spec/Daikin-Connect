import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/unit_model.dart';
import 'api_service.dart';

class UnitService {
  final ApiService _apiService = ApiService();
  final String _cacheBox = 'unit_cache';

  Future<Map<String, dynamic>> getUnitByToken(String token) async {
    try {
      final response = await _apiService.client.get('/units/$token');
      
      if (response.statusCode == 200) {
        final unitData = response.data['data'];
        final unit = UnitModel.fromJson(unitData);
        
        // Save to cache for offline use
        final box = Hive.box(_cacheBox);
        await box.put(token, jsonEncode(unitData));
        
        return {'success': true, 'unit': unit};
      }
      return {'success': false, 'message': 'Unit not found'};
    } on DioException catch (e) {
      // Fallback to cache if network error
      try {
        final box = Hive.box(_cacheBox);
        final cachedData = box.get(token);
        
        if (cachedData != null) {
          final unit = UnitModel.fromJson(jsonDecode(cachedData));
          return {
            'success': true, 
            'unit': unit, 
            'message': 'Loaded from cache (Offline Mode)'
          };
        }
      } catch (cacheError) {
        print("Cache lookup failed: $cacheError");
      }

      return {
        'success': false, 
        'message': e.response?.data['message'] ?? 'Network error'
      };
    }
  }

  Future<List<UnitModel>> getAllCachedUnits() async {
    try {
      final box = Hive.box(_cacheBox);
      final List<UnitModel> units = [];
      
      for (var key in box.keys) {
        final cachedData = box.get(key);
        if (cachedData != null) {
          units.add(UnitModel.fromJson(jsonDecode(cachedData)));
        }
      }
      return units;
    } catch (e) {
      print("Error getting cached units: $e");
      return [];
    }
  }
}
