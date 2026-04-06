import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';

class VersionProvider with ChangeNotifier {
  String _currentVersion = "";
  String _requiredVersion = "";
  bool _isUpdateRequired = false;
  bool _isLoading = true;

  String get currentVersion => _currentVersion;
  String get requiredVersion => _requiredVersion;
  bool get isUpdateRequired => _isUpdateRequired;
  bool get isLoading => _isLoading;

  VersionProvider() {
    init();
  }

  Future<void> init() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      _currentVersion = "V${packageInfo.version}.${packageInfo.buildNumber}";
      notifyListeners();
    } catch (e) {
      if (kDebugMode) print("Error initializing VersionProvider: $e");
    }
  }

  void checkVersion(String serverRequiredVersion) {
    _requiredVersion = serverRequiredVersion;
    
    // Simple string comparison for strict compliance as requested
    // If not equal, update is required.
    _isUpdateRequired = _currentVersion != _requiredVersion;
    _isLoading = false;
    
    if (kDebugMode) {
      print("Local Version: $_currentVersion");
      print("Required Version: $_requiredVersion");
      print("Update Required: $_isUpdateRequired");
    }
    
    notifyListeners();
  }
}
