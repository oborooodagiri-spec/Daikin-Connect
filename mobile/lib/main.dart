import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:local_auth/local_auth.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const DaikinConnectApp());
}

class DaikinConnectApp extends StatelessWidget {
  const DaikinConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Daikin Connect',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF001529),
        primaryColor: const Color(0xFF00A1E4),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00A1E4),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const SecureShellScreen(),
    );
  }
}

class SecureShellScreen extends StatefulWidget {
  const SecureShellScreen({super.key});

  @override
  State<SecureShellScreen> createState() => _SecureShellScreenState();
}

class _SecureShellScreenState extends State<SecureShellScreen> {
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _isAuthenticated = false;
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF001529))
      ..loadRequest(Uri.parse('http://103.196.155.200:23000'));
      
    _authenticate();
  }

  Future<void> _authenticate() async {
    try {
      final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

      if (!canAuthenticate) {
          setState(() { _isAuthenticated = true; });
          return;
      }

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Please authenticate to access Daikin Connect',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );

      if (didAuthenticate) {
        setState(() { _isAuthenticated = true; });
      } else {
        // Retry
        _authenticate();
      }
    } on PlatformException catch (_) {
      setState(() { _isAuthenticated = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/images/daikin_logo.png', width: 200),
              const SizedBox(height: 50),
              const CircularProgressIndicator(color: Color(0xFF00A1E4)),
              const SizedBox(height: 20),
              const Text("Authenticating secure session...", style: TextStyle(color: Colors.white70))
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
