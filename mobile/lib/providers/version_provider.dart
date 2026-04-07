import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:hive_flutter/hive_flutter.dart';

class VersionProvider with ChangeNotifier {
  String _currentVersion = "";
  String _requiredVersion = "";
  bool _isUpdateRequired = false;
  bool _isLoading = true;
  
  static const String _boxName = 'version_settings';
  static const String _keyRequiredVersion = 'required_version';

  String get currentVersion => _currentVersion;
  String get requiredVersion => _requiredVersion;
  bool get isUpdateRequired => _isUpdateRequired;
  bool get isLoading => _isLoading;

  VersionProvider() {
    init();
  }

  Future<void> init() async {
    try {
      // Ensure Hive is initialized (SyncService handles Hive.initFlutter)
      final box = await Hive.openBox(_boxName);
      _requiredVersion = box.get(_keyRequiredVersion, defaultValue: "") as String;
      
      final packageInfo = await PackageInfo.fromPlatform();
      _currentVersion = "V${packageInfo.version}.${packageInfo.buildNumber}";
      
      // Perform initial check with cached version
      if (_requiredVersion.isNotEmpty) {
        _isUpdateRequired = _currentVersion != _requiredVersion;
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) print("Error initializing VersionProvider: $e");
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> checkVersion(String serverRequiredVersion) async {
    if (_requiredVersion == serverRequiredVersion && !_isLoading) return;
    
    _requiredVersion = serverRequiredVersion;
    
    // Save to local storage for offline use
    try {
      final box = await Hive.openBox(_boxName);
      await box.put(_keyRequiredVersion, _requiredVersion);
    } catch (e) {
      if (kDebugMode) print("Error saving version info: $e");
    }
    
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
