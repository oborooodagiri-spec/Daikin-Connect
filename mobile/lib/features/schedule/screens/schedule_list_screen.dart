import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/schedule_provider.dart';
import '../../../models/unit_model.dart';
import '../../units/screens/unit_passport_screen.dart';

class ScheduleListScreen extends StatefulWidget {
  const ScheduleListScreen({super.key});

  @override
  State<ScheduleListScreen> createState() => _ScheduleListScreenState();
}

class _ScheduleListScreenState extends State<ScheduleListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ScheduleProvider>(context, listen: false).fetchMySchedules();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: const Color(0xFF040814),
        title: const Text("My Priority Tasks", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Consumer<ScheduleProvider>(
        builder: (context, schedule, _) {
          if (schedule.isLoading) return const Center(child: CircularProgressIndicator());
          if (schedule.error != null) return Center(child: Text("Error: ${schedule.error}", style: const TextStyle(color: Colors.red)));
          if (schedule.schedules.isEmpty) return const Center(child: Text("No tasks assigned for today.", style: TextStyle(color: Colors.white38)));

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: schedule.schedules.length,
            itemBuilder: (context, index) {
              final item = schedule.schedules[index];
              return _buildScheduleCard(item);
            },
          );
        },
      ),
    );
  }

  Widget _buildScheduleCard(dynamic item) {
    // Assuming 'item' has unit data and time
    final String tagNumber = item['unit']?['tag_number'] ?? 'Unknown Unit';
    final String project = item['unit']?['project_name'] ?? 'General';
    final String type = item['type'] ?? 'Maintenance';
    final DateTime date = DateTime.tryParse(item['scheduled_at'] ?? '') ?? DateTime.now();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(20),
        onTap: () {
          // Navigator logic to UnitPassport
          // Navigator.push(context, MaterialPageRoute(builder: (context) => UnitPassportScreen(unit: UnitModel.fromJson(item['unit']))));
        },
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0x0D00A1E4), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.calendar_today, color: Color(0xFF00A1E4), size: 20),
        ),
        title: Text(tagNumber, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(project, style: const TextStyle(color: Colors.white38, fontSize: 11)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: const Color(0x1AFFFFFF), borderRadius: BorderRadius.circular(6)),
              child: Text(type.toUpperCase(), style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 8, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(DateFormat('HH:mm').format(date), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            const Text("Scheduled", style: TextStyle(color: Colors.white24, fontSize: 8)),
          ],
        ),
      ),
    );
  }
}
