import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../../providers/auth_provider.dart';
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
          content: Text(authProvider.error ?? 'Request Failed'),
          backgroundColor: const Color(0xFFFF5252),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FadeInDown(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset('assets/images/daikin_logo.png', height: 40),
                    const SizedBox(width: 20),
                    Container(width: 1, height: 30, color: const Color(0x3DFFFFFF)),
                    const SizedBox(width: 20),
                    Image.asset('assets/images/logo_epl_connect_1.png', height: 40),
                  ],
                ),
              ),
              const SizedBox(height: 50),
              
              FadeInUp(
                duration: const Duration(milliseconds: 800),
                child: Column(
                  children: [
                    Text(
                      _isRequestMode ? "REQUEST ACCESS" : "SMART HVAC",
                      style: GoogleFonts.inter(
                        fontSize: _isRequestMode ? 22 : 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 2,
                      ),
                    ),
                    if (!_isRequestMode)
                      Text(
                        "MANAGEMENT SYSTEMS",
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF00A1E4),
                          letterSpacing: 4,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 50),

              if (_isRequestMode) ...[
                _buildTextField(
                  controller: _nameController,
                  hint: "Full Name",
                  icon: Icons.person_outline,
                ),
                const SizedBox(height: 15),
                _buildTextField(
                  controller: _companyController,
                  hint: "Company Name",
                  icon: Icons.business_outlined,
                ),
                const SizedBox(height: 15),
              ],

              _buildTextField(
                controller: _emailController,
                hint: "Email Address",
                icon: Icons.mail_outline,
              ),
              const SizedBox(height: 15),
              
              _buildTextField(
                controller: _passwordController,
                hint: "Password",
                icon: Icons.lock_outline,
                isPassword: true,
                showPassword: _showPassword,
                onToggle: () => setState(() => _showPassword = !_showPassword),
              ),
              
              if (!_isRequestMode)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
                      );
                    },
                    child: const Text(
                      "Forgot Password?",
                      style: TextStyle(color: Color(0x8AFFFFFF), fontSize: 11),
                    ),
                  ),
                ),

              const SizedBox(height: 20),

              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  return SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: auth.isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00A1E4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: auth.isLoading 
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            _isRequestMode ? "SUBMIT REQUEST" : "AUTHENTICATE",
                            style: TextStyle(
                              color: Colors.white, 
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                            ),
                          ),
                    ),
                  );
                }
              ),
              
              const SizedBox(height: 40),
              _buildDownloaderSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDownloaderSection() {
    return FadeInUp(
      delay: const Duration(milliseconds: 1000),
      child: Column(
        children: [
          Text(
            "DOWNLOAD APP",
            style: GoogleFonts.inter(
              color: const Color(0x3DFFFFFF),
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDownloadIcon(Icons.android, "ANDROID"),
              const SizedBox(width: 40),
              _buildDownloadIcon(Icons.apple, "IOS"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDownloadIcon(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0x08FFFFFF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0x0DFFFFFF)),
          ),
          child: Icon(icon, color: const Color(0x61FFFFFF), size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            color: const Color(0x3DFFFFFF),
            fontSize: 7,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ],
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
        color: const Color(0x0DFFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword && !showPassword,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0x61FFFFFF)),
          prefixIcon: Icon(icon, color: const Color(0x61FFFFFF), size: 20),
          suffixIcon: isPassword 
            ? IconButton(
                icon: Icon(showPassword ? Icons.visibility_off : Icons.visibility, color: const Color(0x61FFFFFF), size: 20),
                onPressed: onToggle,
              )
            : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 18),
        ),
      ),
    );
  }
}
