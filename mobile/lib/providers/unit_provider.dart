import 'package:flutter/material.dart';
import '../services/api_service.dart';

class UnitProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _units = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get units => _units;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchUnits({String? projectId, String? customerId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String url = '/units';
      Map<String, String> queryParams = {};
      
      if (projectId != null) queryParams['projectId'] = projectId;
      if (customerId != null) queryParams['customerId'] = customerId;
      
      if (queryParams.isNotEmpty) {
        url += '?' + queryParams.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      final response = await _apiService.client.get(url);
      if (response.data != null && response.data['success'] == true) {
        _units = response.data['data'];
      }
    } catch (e) {
      _error = e.toString();
      debugPrint("UnitProvider Error: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh({String? projectId, String? customerId}) => fetchUnits(projectId: projectId, customerId: customerId);
}
