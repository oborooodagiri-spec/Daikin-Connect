import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _summaryData;
  List<dynamic> _recentActivities = [];
  List<dynamic> _trendData = [];
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get summaryData => _summaryData;
  List<dynamic> get recentActivities => _recentActivities;
  List<dynamic> get trendData => _trendData;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Fetch Summary Counts
      final summaryRes = await _apiService.client.get('/dashboard/summary');
      if (summaryRes.data != null && summaryRes.data['success'] == true) {
        _summaryData = summaryRes.data['data'];
      }

      // 2. Fetch Recent Activities (Reports)
      final reportsRes = await _apiService.client.get('/reports');
      if (reportsRes.data != null && reportsRes.data['success'] == true) {
        _recentActivities = reportsRes.data['data'];
      }

      // 3. Fetch Trend Data (Charts)
      final trendRes = await _apiService.client.get('/dashboard/trends');
      if (trendRes.data != null && trendRes.data['success'] == true) {
        _trendData = trendRes.data['data'];
      }
    } catch (e) {
      _error = e.toString();
      debugPrint("DashboardProvider Error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => loadDashboardData();
}
