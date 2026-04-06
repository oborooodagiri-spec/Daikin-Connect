import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';

class VersionGuardScreen extends StatelessWidget {
  final String currentVersion;
  final String requiredVersion;

  const VersionGuardScreen({
    super.key,
    required this.currentVersion,
    required this.requiredVersion,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: Center(
        child: FadeInDown(
          child: Padding(
            padding: const EdgeInsets.all(40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(30),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.system_update_rounded, size: 80, color: Color(0xFF00A1E4)),
                ),
                const SizedBox(height: 40),
                Text(
                  "UPDATE REQUIRED",
                  style: GoogleFonts.inter(
                    color: const Color(0xFF00A1E4),
                    fontWeight: FontWeight.black,
                    fontSize: 24,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 15),
                const Text(
                  "NEW VERSION AVAILABLE",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 20),
                Text(
                  "The current app version ($currentVersion) is no longer compatible with the Daikin Connect platform. Please update to the required version ($requiredVersion) to continue.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white54, fontSize: 13, height: 1.5),
                ),
                const SizedBox(height: 40),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0x1AFFFFFF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.info_outline, color: Colors.blue, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        "Latest: $requiredVersion",
                        style: const TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 50),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: () {
                      // In real scenario, link to App Store/Play Store
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Redirecting to App Store...")),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text("UPDATE NOW", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
