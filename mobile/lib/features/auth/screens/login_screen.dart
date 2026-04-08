import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/glass_widgets.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _companyController = TextEditingController();
  
  bool _showPassword = false;
  bool _isRequestMode = false;

  void _handleLogin() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    bool success;
    if (_isRequestMode) {
      success = false; 
    } else {
      success = await authProvider.login(
        _emailController.text, 
        _passwordController.text
      );
    }

    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Authentication Failed'),
          backgroundColor: const Color(0xFFFF5252),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF00A1E4).withOpacity(0.05),
              ),
            ),
          ),
          
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  FadeInDown(
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset('assets/images/daikin_logo.png', height: 32, color: Colors.white),
                            const SizedBox(width: 15),
                            Container(width: 1, height: 25, color: Colors.white12),
                            const SizedBox(width: 15),
                            Image.asset('assets/images/logo_epl_connect_1.png', height: 35, color: Colors.white),
                          ],
                        ),
                        const SizedBox(height: 40),
                        Text(
                          _isRequestMode ? "ACCESS REQUEST" : "COMMAND CENTER",
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF00A1E4),
                            letterSpacing: 4,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _isRequestMode ? "Join Ecosystem" : "Secure Gateway",
                          style: GoogleFonts.inter(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  FadeInUp(
                    duration: const Duration(milliseconds: 800),
                    child: GlassCard(
                      padding: const EdgeInsets.all(24),
                      opacity: 0.05,
                      child: Column(
                        children: [
                          if (_isRequestMode) ...[
                            _buildTextField(
                              controller: _nameController,
                              hint: "Full Identity",
                              icon: Icons.person_outline,
                            ),
                            const SizedBox(height: 16),
                            _buildTextField(
                              controller: _companyController,
                              hint: "Entity / Company",
                              icon: Icons.business_outlined,
                            ),
                            const SizedBox(height: 16),
                          ],
                          _buildTextField(
                            controller: _emailController,
                            hint: "Enterprise Email",
                            icon: Icons.alternate_email_rounded,
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _passwordController,
                            hint: "Access Key",
                            icon: Icons.vpn_key_outlined,
                            isPassword: true,
                            showPassword: _showPassword,
                            onToggle: () => setState(() => _showPassword = !_showPassword),
                          ),
                          if (!_isRequestMode)
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {
                                  Navigator.push(context, MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()));
                                },
                                child: const Text(
                                  "Trouble signing in?",
                                  style: TextStyle(color: Colors.white24, fontSize: 11),
                                ),
                              ),
                            ),
                          const SizedBox(height: 12),
                          Consumer<AuthProvider>(
                            builder: (context, auth, _) {
                              return SizedBox(
                                width: double.infinity,
                                height: 52,
                                child: ElevatedButton(
                                  onPressed: auth.isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00A1E4),
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                  ),
                                  child: auth.isLoading 
                                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                    : Text(
                                        _isRequestMode ? "SUBMIT REQUEST" : "AUTHENTICATE",
                                        style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 12),
                                      ),
                                ),
                              );
                            }
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  TextButton(
                    onPressed: () => setState(() => _isRequestMode = !_isRequestMode),
                    child: Text(
                      _isRequestMode ? "ALREADY HAS ACCESS? SIGN IN" : "NO ACCESS? REQUEST AUTHORIZATION",
                      style: const TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  Text(
                    "VERSION 2.0.0-GOLD",
                    style: GoogleFonts.inter(
                      color: const Color(0x1AFFFFFF),
                      fontSize: 8,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    bool showPassword = false,
    VoidCallback? onToggle,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword && !showPassword,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        cursorColor: const Color(0xFF00A1E4),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
          prefixIcon: Icon(icon, color: Colors.white24, size: 18),
          suffixIcon: isPassword 
            ? IconButton(
                icon: Icon(showPassword ? Icons.visibility_off : Icons.visibility, color: Colors.white24, size: 18),
                onPressed: onToggle,
              )
            : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
