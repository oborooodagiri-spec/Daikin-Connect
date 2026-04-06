import 'package:flutter/material.dart';
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
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Services
  await SyncService().init();
  await NotificationService().init();

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

class DaikinConnectApp extends StatelessWidget {
  const DaikinConnectApp({super.key});

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
          // Perform version check if we have the requirement from server
          if (auth.requiredVersion != null) {
            version.checkVersion(auth.requiredVersion!);
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
