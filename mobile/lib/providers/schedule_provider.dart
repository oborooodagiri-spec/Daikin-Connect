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

  Future<void> fetchMySchedules() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/api/v1/schedules/my');
      if (response.data is List) {
        _schedules = response.data;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
