import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';

class ChatProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _error;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchMessages(String unitId, String currentUserId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/api/v1/threads/$unitId');
      if (response.data is List) {
        _messages = (response.data as List)
            .map((m) => ChatMessage.fromJson(m, currentUserId))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendMessage(String unitId, String message, String currentUserId, {List<String>? photos}) async {
    try {
      final response = await _apiService.client.post('/api/v1/threads/$unitId', data: {
        'message': message,
        'photos': photos ?? [],
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Optimistic update or refetch
        final newMessage = ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          senderName: 'Me',
          message: message,
          timestamp: DateTime.now(),
          isMe: true,
          photos: photos,
        );
        _messages.add(newMessage);
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
    return false;
  }
}
