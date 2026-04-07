import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/schedule_provider.dart';
import 'providers/version_provider.dart';
import 'services/sync_service.dart';
import 'services/notification_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/dashboard/screens/dashboard_home.dart';
import 'widgets/version_guard_screen.dart';

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Initialize SyncService first (it handles Hive.initFlutter)
    await SyncService().init();
    
    // Initialize other services (don't let them crash the startup)
    try {
      await NotificationService().init();
    } catch (e) {
      if (kDebugMode) print("Notification Service failed: $e");
    }
  } catch (e) {
    if (kDebugMode) print("Critical initialization failed: $e");
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => VersionProvider()),
        ChangeNotifierProvider(create: (context) => AuthProvider()..checkAuthStatus()),
        ChangeNotifierProvider(create: (context) => ChatProvider()),
        ChangeNotifierProvider(create: (context) => ScheduleProvider()),
      ],
      child: const DaikinConnectApp(),
    ),
  );
}

class DaikinConnectApp extends StatefulWidget {
  const DaikinConnectApp({super.key});

  @override
  State<DaikinConnectApp> createState() => _DaikinConnectAppState();
}

class _DaikinConnectAppState extends State<DaikinConnectApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Daikin Connect',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF00A1E4),
        scaffoldBackgroundColor: const Color(0xFF040814),
        useMaterial3: true,
      ),
      home: Consumer2<AuthProvider, VersionProvider>(
        builder: (context, auth, version, _) {
          // Trigger version check safely AFTER the frame is rendered
          if (auth.requiredVersion != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                version.checkVersion(auth.requiredVersion!);
              }
            });
          }

          if (version.isUpdateRequired && !version.isLoading) {
            return VersionGuardScreen(
              currentVersion: version.currentVersion,
              requiredVersion: version.requiredVersion,
            );
          }

          return auth.isLoggedIn 
              ? const DashboardHome() 
              : const LoginScreen();
        },
      ),
    );
  }
}
