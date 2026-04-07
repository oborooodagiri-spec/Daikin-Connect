import 'dart:io';
import 'package:light_compressor/light_compressor.dart';
import 'package:path_provider/path_provider.dart';

class VideoCompressorService {
  final LightCompressor _lightCompressor = LightCompressor();

  Future<File?> compressVideo(File file) async {
    final Directory tempDir = await getTemporaryDirectory();
    final String targetPath = "${tempDir.path}/compressed_${DateTime.now().millisecondsSinceEpoch}.mp4";

    try {
      final dynamic response = await _lightCompressor.compressVideo(
        path: file.path,
        videoQuality: VideoQuality.medium, // Balance between size and quality
        isMinBitrateCheckEnabled: false,
        videoFormat: VideoFormat.mp4,
        android: AndroidConfig(isSoftReboot: false),
        ios: IosConfig(saveInGallery: false),
      );

      if (response is OnSuccess) {
        return File(response.destinationPath);
      } else if (response is OnFailure) {
        print("Video compression failed: ${response.message}");
        return file; // Fallback to original if failed
      } else if (response is OnCancelled) {
        print("Video compression cancelled");
        return null;
      }
    } catch (e) {
      print("Error during video compression: $e");
    }
    return file;
  }
}
