import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/unit_model.dart';
import '../../reports/screens/corrective_report_screen.dart';
import '../../reports/screens/preventive_report_screen.dart';
import '../../reports/screens/complaint_screen.dart';
import '../../reports/screens/audit_report_screen.dart';

class UnitPassportScreen extends StatelessWidget {
  final UnitModel unit;

  const UnitPassportScreen({super.key, required this.unit});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF003366),
          title: Text(unit.tagNumber, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          iconTheme: const IconThemeData(color: Colors.white),
          bottom: const TabBar(
            isScrollable: true,
            labelColor: Color(0xFF00A1E4),
            unselectedLabelColor: Colors.white54,
            indicatorColor: Color(0xFF00A1E4),
            tabs: [
              Tab(text: "INFO"),
              Tab(text: "CORRECTIVE"),
              Tab(text: "PREVENTIVE"),
              Tab(text: "AUDIT"),
              Tab(text: "HISTORY"),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildInfoTab(context),
            _buildActionTab(context, "Corrective", Icons.hammer_rounded, Colors.roseAccent),
            _buildActionTab(context, "Preventive", Icons.build_rounded, Colors.blueAccent),
            _buildActionTab(context, "Audit", Icons.cleaning_services_rounded, Colors.teal),
            _buildHistoryTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildInfoCard("Unit Specifications", [
            _buildInfoRow("Brand", unit.brand),
            _buildInfoRow("Model", unit.model),
            _buildInfoRow("Capacity", unit.capacity),
            _buildInfoRow("Type", unit.unitType),
          ]),
          const SizedBox(height: 20),
          _buildInfoCard("Location Details", [
            _buildInfoRow("Project", unit.projectName),
            _buildInfoRow("Area", unit.area),
          ]),
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ComplaintScreen(unit: unit)),
                );
              },
              icon: const Icon(Icons.warning_amber_rounded, color: Colors.white),
              label: const Text("REPORT ISSUE", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 2)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent.withOpacity(0.8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
          const SizedBox(height: 15),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildActionTab(BuildContext context, String title, IconData icon, Color color) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 60, color: color.withOpacity(0.5)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              if (title == "Corrective") {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CorrectiveReportScreen(unit: unit)),
                );
              } else if (title == "Preventive") {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => PreventiveReportScreen(unit: unit)),
                );
              } else if (title == "Audit") {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => AuditReportScreen(unit: unit)),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: color),
            child: Text("NEW ${title.toUpperCase()} REPORT", style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab() {
    return const Center(
      child: Text("Service History (Master Log)", style: TextStyle(color: Colors.white54)),
    );
  }
}
