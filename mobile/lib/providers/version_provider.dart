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
      _requiredVersion = box.get(_keyRequiredVersion, defaultValue: "V1.8.0") as String;
      
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
    
    // Check if update is required (Only if current < required)
    _isUpdateRequired = _shouldUpdate(_currentVersion, _requiredVersion);
    _isLoading = false;
    
    if (kDebugMode) {
      print("Local Version: $_currentVersion");
      print("Required Version: $_requiredVersion");
      print("Update Required: $_isUpdateRequired");
    }
    
    notifyListeners();
  }

  bool _shouldUpdate(String current, String required) {
    if (current == required || required.isEmpty) return false;
    
    try {
      // Clean versions (remove 'V' and non-numeric suffixes if any)
      final cleanCurrent = current.replaceAll(RegExp(r'[^0-9.]'), '');
      final cleanRequired = required.replaceAll(RegExp(r'[^0-9.]'), '');
      
      final currentParts = cleanCurrent.split('.').map((e) => int.tryParse(e) ?? 0).toList();
      final requiredParts = cleanRequired.split('.').map((e) => int.tryParse(e) ?? 0).toList();
      
      // Pad lists to match length
      final length = currentParts.length > requiredParts.length ? currentParts.length : requiredParts.length;
      while (currentParts.length < length) currentParts.add(0);
      while (requiredParts.length < length) requiredParts.add(0);
      
      for (int i = 0; i < length; i++) {
        if (currentParts[i] < requiredParts[i]) return true; // Needs update
        if (currentParts[i] > requiredParts[i]) return false; // Newer or safe
      }
    } catch (e) {
      if (kDebugMode) print("Version comparison failed: $e");
    }
    
    return false; // Default: no update
  }
}
