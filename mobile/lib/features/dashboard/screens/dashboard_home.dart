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
          padding: const EdgeInsets.fromLTRB(24, 60, 24, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "COMMAND CENTER",
                        style: GoogleFonts.inter(
                          color: const Color(0xFF00A1E4),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Hello, ${auth.user?['name']?.split(' ')[0] ?? 'Operator'}",
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  const CircleAvatar(
                    radius: 24,
                    backgroundColor: Color(0x0DFFFFFF),
                    child: Icon(Icons.person_outline, color: Colors.white70),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              GlassCard(
                padding: const EdgeInsets.all(16),
                opacity: 0.05,
                child: Row(
                  children: [
                    Icon(Icons.wifi_tethering, color: Colors.greenAccent, size: 16),
                    SizedBox(width: 10),
                    Text(
                      "SYSTEM STATUS: OPTIMAL",
                      style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                    Spacer(),
                    Text("14ms", style: TextStyle(color: Colors.white24, fontSize: 10)),
                  ],
                ),
              ),
            ],
          ),
        ),
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
          childAspectRatio: 1.4,
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
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(value, style: TextStyle(color: color, fontSize: 28, fontWeight: FontWeight.w900)),
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
    return SliverToBoxAdapter(
      child: FadeInUp(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "INFRASTRUCTURE ACCESS",
                style: TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _buildPanelItem(
                      icon: Icons.qr_code_scanner_rounded, 
                      label: "SCANNER", 
                      color: const Color(0xFF00A1E4),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const UnitScannerScreen())),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildPanelItem(
                      icon: Icons.history_rounded, 
                      label: "ACTIVITY", 
                      color: const Color(0xFF009688),
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ReportsListScreen())),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildPanelItem(
                icon: Icons.analytics_outlined, 
                label: "IMMERSIVE ANALYTICS", 
                color: const Color(0xFF448AFF),
                isFullWidth: true,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const WebDashboardScreen())),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPanelItem({
    required IconData icon, 
    required String label, 
    required Color color, 
    required VoidCallback onTap,
    bool isFullWidth = false,
  }) {
    return GlassButton(
      onPressed: onTap,
      child: Container(
        width: isFullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 12),
            Text(
              label, 
              style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5),
            ),
          ],
        ),
      ),
    );
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
