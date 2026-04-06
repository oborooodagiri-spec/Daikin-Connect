class ChatMessage {
  final String id;
  final String senderName;
  final String message;
  final DateTime timestamp;
  final bool isMe;
  final List<String>? photos;

  ChatMessage({
    required this.id,
    required this.senderName,
    required this.message,
    required this.timestamp,
    required this.isMe,
    this.photos,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json, String currentUserId) {
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      senderName: json['sender_name'] ?? 'User',
      message: json['message'] ?? '',
      timestamp: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      isMe: json['sender_id']?.toString() == currentUserId,
      photos: json['photos'] != null ? List<String>.from(json['photos']) : null,
    );
  }
}
