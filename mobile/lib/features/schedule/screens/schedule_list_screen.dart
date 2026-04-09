import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:daikin_connect_mobile/widgets/glass_widgets.dart';
import 'package:daikin_connect_mobile/providers/schedule_provider.dart';

class ScheduleListScreen extends StatefulWidget {
  final String? projectId;
  
  const ScheduleListScreen({super.key, this.projectId});

  @override
  State<ScheduleListScreen> createState() => _ScheduleListScreenState();
}

class _ScheduleListScreenState extends State<ScheduleListScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ScheduleProvider>().fetchSchedules(projectId: widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheduleProvider = Provider.of<ScheduleProvider>(context);
    final daySchedules = scheduleProvider.schedules.where((s) {
      final startAt = DateTime.parse(s['start_at'] ?? DateTime.now().toIso8601String());
      return startAt.year == _selectedDate.year && 
             startAt.month == _selectedDate.month && 
             startAt.day == _selectedDate.day;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "PLANNING CENTER",
          style: GoogleFonts.outfit(
            color: const Color(0xFF00A1E4),
            fontWeight: FontWeight.bold,
            letterSpacing: 4.0,
            fontSize: 12.0,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildDateSelector(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => scheduleProvider.refresh(projectId: widget.projectId),
              color: const Color(0xFF00A1E4),
              backgroundColor: const Color(0xFF040814),
              child: scheduleProvider.isLoading && daySchedules.isEmpty
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
                : daySchedules.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                      physics: const BouncingScrollPhysics(),
                      itemCount: daySchedules.length,
                      itemBuilder: (context, index) {
                        final schedule = daySchedules[index];
                        return _buildScheduleCard(schedule, index);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return Container(
      height: 100,
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 30, 
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index - 2)); 
          final isSelected = date.year == _selectedDate.year && 
                            date.month == _selectedDate.month && 
                            date.day == _selectedDate.day;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedDate = date),
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              width: 50,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF00A1E4) : Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isSelected ? const Color(0xFF00A1E4) : Colors.white.withOpacity(0.1)),
                boxShadow: isSelected ? [BoxShadow(color: const Color(0xFF00A1E4).withOpacity(0.3), blurRadius: 10)] : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    DateFormat('E').format(date).toUpperCase(),
                    style: TextStyle(color: isSelected ? Colors.white : Colors.white38, fontSize: 10.0, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    date.day.toString(),
                    style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 16.0, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildScheduleCard(Map<String, dynamic> schedule, int index) {
    final typeColor = _getTypeColor(schedule['type']);
    final status = schedule['status']?.toString() ?? "Planned";

    return FadeInRight(
      delay: Duration(milliseconds: index * 100),
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        child: IntrinsicHeight(
          child: Row(
            children: [
              Column(
                children: [
                  Text(
                    DateFormat('HH:mm').format(DateTime.parse(schedule['start_at'] ?? DateTime.now().toIso8601String())),
                    style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12.0, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Container(
                      width: 2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [typeColor, typeColor.withOpacity(0.1)],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GlassCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: typeColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              (schedule['type'] ?? "TASK").toString().toUpperCase(),
                              style: TextStyle(color: typeColor, fontSize: 8.0, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                            ),
                          ),
                          _buildStatusIndicator(status),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        (schedule['title'] ?? "UNTITLED TASK").toString().toUpperCase(),
                        style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.0, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.business_rounded, color: Colors.white24, size: 12),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              schedule['projectName'] ?? "General",
                              style: const TextStyle(color: Colors.white38, fontSize: 11.0),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'completed': color = Colors.green; break;
      case 'in progress': color = Colors.blue; break;
      case 'missed': color = Colors.red; break;
      default: color = Colors.white24;
    }

    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          status.toUpperCase(),
          style: TextStyle(color: color, fontSize: 8.0, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Color _getTypeColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'corrective': return Colors.red;
      case 'preventive': return Colors.green;
      case 'audit': return Colors.purple;
      default: return const Color(0xFF00A1E4);
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.calendar_today_outlined, size: 64, color: Colors.white.withOpacity(0.05)),
          const SizedBox(height: 16),
          Text(
            "NO TASKS PLANNED",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.bold, letterSpacing: 2.0),
          ),
        ],
      ),
    );
  }
}
