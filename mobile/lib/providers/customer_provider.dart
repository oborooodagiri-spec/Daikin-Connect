import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CustomerProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _customers = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get customers => _customers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchCustomers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/customers');
      if (response.data != null && response.data['success'] == true) {
        _customers = response.data['data'];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => fetchCustomers();
}
