import 'package:flutter/material.dart';
import '../services/sync_service.dart';

class SyncProvider with ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> queueReport(Map<String, dynamic> report) async {
    _isLoading = true;
    notifyListeners();

    try {
      await SyncService.queueReport(report);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> triggerSync() async {
    _isLoading = true;
    notifyListeners();

    try {
      await SyncService.processQueue();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
