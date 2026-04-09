import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ComplaintProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _complaints = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get complaints => _complaints;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchComplaints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/complaints');
      if (response.data != null && response.data['success'] == true) {
        _complaints = response.data['data'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => fetchComplaints();
}
