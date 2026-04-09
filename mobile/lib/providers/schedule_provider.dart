import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ScheduleProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _schedules = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get schedules => _schedules;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchSchedules({String? projectId, int? month, int? year}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String url = '/schedules';
      Map<String, String> queryParams = {};
      
      if (projectId != null) queryParams['projectId'] = projectId;
      if (month != null) queryParams['month'] = month.toString();
      if (year != null) queryParams['year'] = year.toString();
      
      if (queryParams.isNotEmpty) {
        url += '?' + queryParams.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      final response = await _apiService.client.get(url);
      if (response.data != null && response.data['success'] == true) {
        _schedules = response.data['data'];
      }
    } catch (e) {
      _error = e.toString();
      debugPrint("ScheduleProvider Error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateStatus(String id, String status) async {
    try {
      final response = await _apiService.client.patch('/schedules', data: {
        'id': id,
        'status': status
      });
      if (response.data != null && response.data['success'] == true) {
        // Refresh local list
        final index = _schedules.indexWhere((s) => s['id'] == id);
        if (index != -1) {
          _schedules[index]['status'] = status;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint("Update Status Error: $e");
    }
  }

  Future<void> refresh({String? projectId}) => fetchSchedules(projectId: projectId);
}
