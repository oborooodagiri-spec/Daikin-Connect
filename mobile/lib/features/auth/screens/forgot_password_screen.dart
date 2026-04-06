import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  bool _isSubmitting = false;

  void _submitReset() async {
    if (_emailController.text.isEmpty) return;
    
    setState(() => _isSubmitting = true);
    
    // Abstracted API Call Simulation
    await Future.delayed(const Duration(seconds: 2));

    setState(() => _isSubmitting = false);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("If an account exists, a reset link has been sent."), 
          backgroundColor: const Color(0xFF00A1E4)
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "RESET PASSWORD",
              style: GoogleFonts.inter(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              "Enter the email associated with your EPL Connect account. We'll send you a link to reset your password.",
              style: GoogleFonts.inter(
                fontSize: 12,
                color: Colors.white54,
              ),
            ),
            const SizedBox(height: 40),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white),
              ),
              child: TextField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: "Email Address",
                  hintStyle: TextStyle(color: Colors.white38),
                  prefixIcon: Icon(Icons.mail_outline, color: Colors.white38, size: 20),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 18),
                ),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReset,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00A1E4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isSubmitting 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("SEND RESET LINK", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 2)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

