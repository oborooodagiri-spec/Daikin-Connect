import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProjectProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _projects = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProjects({int? customerId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final url = customerId != null ? '/projects?customerId=$customerId' : '/projects';
      final response = await _apiService.client.get(url);
      if (response.data != null && response.data['success'] == true) {
        _projects = response.data['data'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh({int? customerId}) => fetchProjects(customerId: customerId);
}
