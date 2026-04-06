import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';
import 'package:daikin_connect_mobile/providers/auth_provider.dart';
import 'package:daikin_connect_mobile/features/reports/screens/corrective_report_screen.dart';
import 'package:daikin_connect_mobile/features/reports/screens/preventive_report_screen.dart';
import 'package:daikin_connect_mobile/features/reports/screens/audit_report_screen.dart';
import 'package:daikin_connect_mobile/features/chat/screens/chat_thread_screen.dart';

class UnitPassportScreen extends StatelessWidget {
  final UnitModel asset; // Renamed from unit to avoid shadowing

  const UnitPassportScreen({super.key, required this.asset});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final isTech = auth.isTechnician;
    
    // PROJECT ISOLATION GUARD
    bool hasAccess = true;
    if (auth.isExternal) {
      hasAccess = auth.assignedProjectIds.contains(asset.projectId);
    }

    if (!hasAccess) {
      return _buildAccessDeniedScreen(context, asset);
    }

    return DefaultTabController(
      length: 6,
      child: Scaffold(
        backgroundColor: const Color(0xFF040814),
        appBar: AppBar(
          backgroundColor: const Color(0xFF040814),
          title: Row(
            children: [
              Text(asset.unitTag, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              if (!isTech) 
                Container(
                  margin: const EdgeInsets.only(left: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(4)),
                  child: const Text("READ ONLY", style: TextStyle(color: Colors.white38, fontSize: 8)),
                ),
            ],
          ),
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
              Tab(text: "COMMUNICATION"),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildInfoTab(context),
            _buildActionTab(context, "Corrective", Icons.construction, const Color(0xFFFF5252), isTech),
            _buildActionTab(context, "Preventive", Icons.build, const Color(0xFF448AFF), isTech),
            _buildActionTab(context, "Audit", Icons.cleaning_services, const Color(0xFF009688), isTech),
            _buildHistoryTab(),
            ChatThreadScreen(unit: asset),
          ],
        ),
      ),
    );
  }

  Widget _buildAccessDeniedScreen(BuildContext context, UnitModel _asset) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(backgroundColor: const Color(0xFF040814), iconTheme: const IconThemeData(color: Colors.white)),
      body: Center(
        child: FadeInDown(
          child: Padding(
            padding: const EdgeInsets.all(40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(30),
                  decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.security, size: 80, color: Colors.red),
                ),
                const SizedBox(height: 30),
                const Text(
                  "SECURITY ALERT",
                  style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 24, letterSpacing: 2),
                ),
                const SizedBox(height: 15),
                const Text(
                  "UNAUTHORIZED ACCESS ATTEMPT",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 10),
                Text(
                  "You are not assigned to the project containing unit ${_asset.unitTag}. Access to this asset is restricted to authorized personnel only.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text("RETURN TO DASHBOARD", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                )
              ],
            ),
          ),
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
            _buildInfoRow("Brand", asset.brand),
            _buildInfoRow("Model", asset.model),
            _buildInfoRow("Capacity", asset.capacity),
            _buildInfoRow("Type", asset.unitType),
          ]),
          const SizedBox(height: 20),
          _buildInfoCard("Location Details", [
            _buildInfoRow("Project", asset.projectName),
            _buildInfoRow("Area", asset.area),
          ]),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x1AFFFFFF)),
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
          Text(label, style: const TextStyle(color: Color(0x61FFFFFF), fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildActionTab(BuildContext context, String title, IconData icon, Color color, bool isTech) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 80, color: Color.fromARGB(26, color.red, color.green, color.blue)),
            const SizedBox(height: 20),
            Text(
              "${title.toUpperCase()} MODULE",
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            Text(
              isTech ? "Field technicians only" : "Unauthorized: This module requires technician role",
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 30),
            if (isTech)
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: () {
                    if (title == "Corrective") {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => CorrectiveReportScreen(unit: asset)));
                    } else if (title == "Preventive") {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => PreventiveReportScreen(unit: asset)));
                    } else if (title == "Audit") {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => AuditReportScreen(unit: asset)));
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text("NEW ${title.toUpperCase()} REPORT", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0x1AFFFFFF), borderRadius: BorderRadius.circular(12)),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.lock_outline, color: Colors.white24, size: 14),
                    SizedBox(width: 8),
                    Text("ACCESS RESTRICTED", style: TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTab() {
    return const Center(
      child: Text("Service History (Master Log)", style: TextStyle(color: Color(0x8AFFFFFF))),
    );
  }
}
