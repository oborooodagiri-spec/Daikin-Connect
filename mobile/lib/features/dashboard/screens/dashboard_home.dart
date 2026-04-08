import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/sync_service.dart';
import '../../units/screens/unit_scanner_screen.dart';
import '../../reports/screens/reports_list_screen.dart';
import 'web_dashboard_screen.dart';

class DashboardHome extends StatefulWidget {
  const DashboardHome({super.key});

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isInternal = auth.isInternal;

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: Stack(
        children: [
          // Background Gradient Orbs
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF00A1E4).withOpacity(0.1),
              ),
            ),
          ),
          
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              _buildHeader(auth),
              _buildStatsGrid(isInternal),
              _buildControlPanel(context, auth),
              _buildActivityFeed(),
              const SliverPadding(padding: EdgeInsets.only(bottom: 120)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(AuthProvider auth) {
    return SliverToBoxAdapter(
      child: FadeInDown(
        duration: const Duration(seconds: 1),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "COMMAND CENTER",
                    style: TextStyle(
                      color: Color(0xFF00A1E4),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.emerald,
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.emerald, blurRadius: 4)],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        "HELLO, ${auth.user?['name']?.split(' ')[0] ?? 'OPERATOR'}",
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                ],
              ),
              _buildSyncStatus(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSyncStatus() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.cloud_done_outlined, color: Color(0xFF00A1E4), size: 14),
          SizedBox(width: 6),
          Text(
            "REALTIME",
            style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 9),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(bool isInternal) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.5,
        ),
        delegate: SliverChildListDelegate([
          _buildGlassStat("ACTIVE", "142", "UNITS", const Color(0xFF00A1E4)),
          _buildGlassStat("PENDING", "08", "REPORTS", const Color(0xFFFF9800)),
        ]),
      ),
    );
  }

  Widget _buildGlassStat(String label, String value, String unit, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1)),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(value, style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(unit, style: const TextStyle(color: Colors.white24, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildControlPanel(BuildContext context, AuthProvider auth) {
    final features = [
      {'title': 'REGISTRY', 'icon': Icons.inventory_2, 'color': Colors.blue, 'route': 'native_registry'},
      {'title': 'REPORTS', 'icon': Icons.history_edu, 'color': Colors.purple, 'route': 'native_reports'},
      {'title': 'SCANNER', 'icon': Icons.qr_code_scanner, 'color': const Color(0xFF00A1E4), 'route': 'native_scanner'},
      {'title': 'CLIENTS', 'icon': Icons.business, 'color': Colors.teal, 'url': '/dashboard/customers'},
      {'title': 'PERSONNEL', 'icon': Icons.people, 'color': Colors.orange, 'url': '/dashboard/users'},
      {'title': 'PLANNING', 'icon': Icons.calendar_today, 'color': Colors.indigo, 'url': '/dashboard/schedules'},
      {'title': 'TICKETS', 'icon': Icons.confirmation_number, 'color': Colors.amber, 'url': '/dashboard/complaints'},
      {'title': 'ANALYTICS', 'icon': Icons.analytics, 'color': Colors.red, 'url': '/dashboard'},
    ];

    return SliverToBoxAdapter(
      child: FadeInUp(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "FEATURE HUB",
                style: TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
              ),
              const SizedBox(height: 20),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.8,
                ),
                itemCount: features.length,
                itemBuilder: (context, index) {
                  final f = features[index];
                  final color = f['color'] as Color;
                  return InkWell(
                    onTap: () => _handleFeatureTap(f),
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      children: [
                        Container(
                          width: 54,
                          height: 54,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: color.withOpacity(0.1)),
                          ),
                          child: Icon(f['icon'] as IconData, color: color, size: 24),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          f['title'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white60, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleFeatureTap(Map<String, dynamic> feature) {
    if (feature['route'] == 'native_registry') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const UnitRegistryScreen()));
    } else if (feature['route'] == 'native_reports') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const ReportsListScreen()));
    } else if (feature['route'] == 'native_scanner') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const UnitScannerScreen()));
    } else if (feature['url'] != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => WebDashboardScreen(
            path: feature['url'],
            title: feature['title'],
          ),
        ),
      );
    }
  }

  Widget _buildActivityFeed() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "RECENT OPERATIONS",
              style: TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
            ),
            const SizedBox(height: 20),
            _buildActivityItem("Corrective Report Submitted", "VRV IV - Wisma Atria", "2 mins ago", Icons.check_circle_outline, Colors.blue),
            _buildActivityItem("Unit Scanned", "TAG-109 - Lobby", "15 mins ago", Icons.qr_code_2, Colors.orange),
            _buildActivityItem("System Maintenance Sync", "Cloud DB", "1 hour ago", Icons.sync, Colors.teal),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(String title, String subtitle, String time, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
