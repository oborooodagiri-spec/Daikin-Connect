import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:daikin_connect_mobile/providers/chat_provider.dart';
import 'package:daikin_connect_mobile/providers/auth_provider.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';
import 'package:daikin_connect_mobile/models/chat_message.dart';

class ChatThreadScreen extends StatefulWidget {
  final UnitModel unit;

  const ChatThreadScreen({super.key, required this.unit});

  @override
  State<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends State<ChatThreadScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      Provider.of<ChatProvider>(context, listen: false)
          .fetchMessages(widget.unit.id, auth.user?['id']?.toString() ?? '');
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final userId = auth.user?['id']?.toString() ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: const Color(0xFF040814),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.unit.unitTag, style: const TextStyle(color: Colors.white, fontSize: 16)),
            const Text("Unit Communication Thread", style: TextStyle(color: Colors.white38, fontSize: 10)),
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (context, chat, _) {
                if (chat.isLoading) return const Center(child: CircularProgressIndicator());
                
                final messages = chat.messages;
                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(20),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    return _buildMessageBubble(messages[index]);
                  },
                );
              },
            ),
          ),
          _buildInputArea(userId),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Align(
      alignment: message.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: message.isMe ? const Color(0xFF00A1E4) : const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(message.isMe ? 16 : 0),
            bottomRight: Radius.circular(message.isMe ? 0 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!message.isMe)
              Text(
                message.senderName,
                style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 10, fontWeight: FontWeight.bold),
              ),
            const SizedBox(height: 4),
            Text(
              message.message,
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('HH:mm').format(message.timestamp),
              style: const TextStyle(color: Colors.white24, fontSize: 8),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(String userId) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0x0DFFFFFF),
        border: Border(top: BorderSide(color: Color(0x1AFFFFFF))),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () {}, // Add photo logic
            icon: const Icon(Icons.add_a_photo_outlined, color: Colors.white54),
          ),
          Expanded(
            child: TextField(
              controller: _messageController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: "Type a message...",
                hintStyle: TextStyle(color: Colors.white24),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 16),
              ),
            ),
          ),
          IconButton(
            onPressed: () async {
              if (_messageController.text.isNotEmpty) {
                final success = await Provider.of<ChatProvider>(context, listen: false)
                    .sendMessage(widget.unit.id, _messageController.text, userId);
                if (success) _messageController.clear();
              }
            },
            icon: const Icon(Icons.send_rounded, color: Color(0xFF00A1E4)),
          ),
        ],
      ),
    );
  }
}
