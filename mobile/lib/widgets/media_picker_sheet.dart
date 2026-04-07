import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/video_compressor_service.dart';

class MediaPickerSheet extends StatelessWidget {
  final Function(File, String type) onMediaSelected;
  final ImagePicker _picker = ImagePicker();
  final VideoCompressorService _compressor = VideoCompressorService();

  MediaPickerSheet({super.key, required this.onMediaSelected});

  Future<void> _pickImage(BuildContext context, ImageSource source) async {
    final XFile? image = await _picker.pickImage(
      source: source,
      imageQuality: 70, // Standard compression for photos
    );
    if (image != null) {
      onMediaSelected(File(image.path), 'IMAGE');
      Navigator.pop(context);
    }
  }

  Future<void> _pickVideo(BuildContext context, ImageSource source) async {
    final XFile? video = await _picker.pickVideo(
      source: source,
      maxDuration: const Duration(minutes: 2), // Limit length for field docs
    );
    
    if (video != null) {
      // Show loading indicator during compression
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final File? compressedFile = await _compressor.compressVideo(File(video.path));
      
      Navigator.pop(context); // Close loading
      
      if (compressedFile != null) {
        onMediaSelected(compressedFile, 'VIDEO');
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: const BoxDecoration(
        color: Color(0xFF040814),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            "ADD DOCUMENTATION",
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1),
          ),
          const SizedBox(height: 20),
          ListTile(
            leading: const Icon(Icons.camera_alt, color: Color(0xFF00A1E4)),
            title: const Text("Take Photo", style: TextStyle(color: Colors.white)),
            onTap: () => _pickImage(context, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.videocam, color: Color(0xFF00A1E4)),
            title: const Text("Record Video", style: TextStyle(color: Colors.white)),
            onTap: () => _pickVideo(context, ImageSource.camera),
          ),
          const Divider(color: Colors.white10),
          ListTile(
            leading: const Icon(Icons.photo_library, color: Colors.white70),
            title: const Text("Gallery (Photo)", style: TextStyle(color: Colors.white)),
            onTap: () => _pickImage(context, ImageSource.gallery),
          ),
          ListTile(
            leading: const Icon(Icons.video_library, color: Colors.white70),
            title: const Text("Gallery (Video)", style: TextStyle(color: Colors.white)),
            onTap: () => _pickVideo(context, ImageSource.gallery),
          ),
        ],
      ),
    );
  }
}
