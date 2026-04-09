import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../main.dart';
import '../features/schedule/screens/schedule_list_screen.dart';
import '../features/reports/screens/complaint_list_screen.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal();

  Future<void> init() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/launcher_icon');
    
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        _handleDeepLink(response.payload);
      },
    );
  }

  void _handleDeepLink(String? payload) {
    if (payload == null) return;
    
    final context = DaikinConnectApp.navigatorKey.currentContext;
    if (context == null) return;

    if (payload == 'native_schedules') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const ScheduleListScreen()));
    } else if (payload == 'native_tickets') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const ComplaintListScreen()));
    }
  }

  Future<void> showLocalNotification(int id, String title, String body, {String? payload}) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'daikin_connect_channel',
      'Daikin Connect Notifications',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
    );
    
    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await _localNotifications.show(
      id,
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }
}
