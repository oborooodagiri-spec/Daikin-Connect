import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  bool _isLoggedIn = false;
  Map<String, dynamic>? _user;
  String? _error;
  String? _requiredVersion;

  String? get requiredVersion => _requiredVersion;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;
  String? get error => _error;

  String? get role => _user?['role'];
  bool get isInternal => _user?['isInternal'] ?? false;
  bool get isAdmin => role?.toUpperCase().contains('ADMIN') ?? false;
  bool get isTechnician => role?.toUpperCase() == 'TECHNICIAN';
  bool get isExternal => !isInternal;
  List<String> get assignedProjectIds => List<String>.from(_user?['assignedProjectIds'] ?? []);

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    _requiredVersion = null; // Reset version requirement until checked
    notifyListeners();

    try {
      _isLoggedIn = await _authService.isLoggedIn();
    } catch (e) {
      if (kDebugMode) print("Auth status check failed (usually offline): $e");
      // Keep existing login state if we fail to contact server but have local state
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _authService.login(email, password);
    _isLoading = false;

    if (result['success']) {
      _isLoggedIn = true;
      _user = result['user'];
      _requiredVersion = result['required_version'];
      notifyListeners();
      return true;
    } else {
      _error = result['message'];
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }
}
