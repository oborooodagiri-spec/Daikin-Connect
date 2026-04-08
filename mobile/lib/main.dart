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
import 'features/dashboard/screens/main_navigation_container.dart';
import 'widgets/version_guard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize SyncService (handles Hive)
    await SyncService().init().timeout(const Duration(seconds: 10));
    
    // Optional services (errors shouldn't crash startup)
    try {
      await NotificationService().init().timeout(const Duration(seconds: 5));
    } catch (e) {
      if (kDebugMode) print("Notification Service failed: $e");
    }
  } catch (e) {
    if (kDebugMode) print("Initialization failed: $e");
    // We still try to run the app; errors will be handled in the UI
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
              ? const MainNavigationContainer() 
              : const LoginScreen();
        },
      ),
    );
  }
}
