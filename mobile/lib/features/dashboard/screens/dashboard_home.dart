import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import '../../../widgets/floating_nav_bar.dart';
import '../../units/screens/unit_scanner_screen.dart';
import '../../reports/screens/reports_list_screen.dart';
import '../../../services/sync_service.dart';
import '../../../providers/auth_provider.dart';
import '../../schedule/screens/schedule_list_screen.dart';
import '../../units/screens/unit_passport_screen.dart';
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
    final isTech = auth.isTechnician;
    final isAdmin = auth.isAdmin;
    final isInternal = auth.isInternal;

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context, auth),
          if (isTech) _buildNextTaskSection(context),
          if (isInternal) _buildSummarySection(),
          if (isInternal) _buildSyncStatusSliver(),
          _buildQuickActions(context, auth),
          if (!isInternal) _buildExternalWelcome(auth),
          const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context, AuthProvider auth) {
    return SliverAppBar(
      expandedHeight: 120.0,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF040814),
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          auth.isInternal ? "DAIKIN CONNECT" : "DAIKIN PROJECT HUB",
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF00A1E4),
            letterSpacing: 4,
          ),
        ),
        centerTitle: true,
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.notifications_none, color: Colors.white54),
        ),
        const SizedBox(width: 10),
      ],
    );
  }

  Widget _buildExternalWelcome(AuthProvider auth) {
    return SliverToBoxAdapter(
      child: FadeIn(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("WELCOME BACK,", style: GoogleFonts.inter(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
              const SizedBox(height: 5),
              Text(auth.user?['name'] ?? "User", style: GoogleFonts.inter(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0x08FFFFFF),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0x1AFFFFFF)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: Color(0xFF00A1E4), size: 20),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Text(
                        "You have access to ${auth.assignedProjectIds.length} assigned projects. Scan a unit to begin monitoring.",
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNextTaskSection(BuildContext context) {
    return SliverToBoxAdapter(
      child: FadeInDown(
        child: Container(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00A1E4), Color(0xFF005691)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00A1E4).withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("NEXT ASSIGNMENT", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(6)),
                    child: const Text("URGENT", style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              const Text("DAIKIN VRV IV - TAG-204", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
              const Text("Project: Wisma Atria - Level 4", style: TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 20),
              Row(
                children: [
                  const Icon(Icons.access_time, color: Colors.white, size: 14),
                  const SizedBox(width: 8),
                  const Text("10:30 AM", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const ScheduleListScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF00A1E4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text("VIEW SCHEDULE"),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummarySection() {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.6,
        ),
        delegate: SliverChildListDelegate([
          _buildStatCard("ACTIVE UNITS", "142", const Color(0xFF009688)),
          _buildStatCard("TOTAL ASSETS", "318", const Color(0xFF00A1E4)),
        ]),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Color(0x61FFFFFF), fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildSyncStatusSliver() {
    final syncService = SyncService();
    return SliverToBoxAdapter(
      child: ValueListenableBuilder(
        valueListenable: syncService.offlineBox.listenable(),
        builder: (context, box, _) {
          final count = box.length;
          if (count == 0) return const SizedBox.shrink();
          return GestureDetector(
            onTap: () => syncService.syncPendingReports(),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x1AFF5252),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x33FF5252)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sync, color: Color(0xFFFF5252), size: 16),
                  const SizedBox(width: 10),
                  Text("$count REPORTS PENDING SYNC", style: const TextStyle(color: Color(0xFFFF5252), fontSize: 9, fontWeight: FontWeight.bold)),
                  const Spacer(),
                  const Text("SYNC NOW", style: TextStyle(color: Color(0xFFFF5252), fontSize: 8, decoration: TextDecoration.underline)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, AuthProvider auth) {
    final isAdmin = auth.isAdmin;
    final isTech = auth.isTechnician;

    return SliverToBoxAdapter(
      child: FadeInUp(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("QUICK ACCESS", style: TextStyle(color: Color(0xFF00A1E4), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(child: _buildActionCard(context, Icons.qr_code_scanner, "SCAN UNIT", const Color(0xFF00A1E4), const UnitScannerScreen())),
                  const SizedBox(width: 15),
                  if (isAdmin) 
                    Expanded(child: _buildActionCard(context, Icons.people_alt, "USERS", const Color(0xFFFF9800), const Scaffold(body: Center(child: Text("Web Access Only"))))),
                  if (!isAdmin && isTech) 
                    Expanded(child: _buildActionCard(context, Icons.assignment, "MY TASKS", const Color(0xFF448AFF), const ScheduleListScreen())),
                  if (!isAdmin && !isTech)
                    Expanded(child: _buildActionCard(context, Icons.forum, "SUPPORT", const Color(0xFF009688), const Scaffold(body: Center(child: Text("Chat with Administrator"))))),
                ],
              ),
              const SizedBox(height: 15),
              _buildActionCard(
                context, 
                Icons.analytics, 
                "MASTER DASHBOARD", 
                const Color(0xFF00A1E4), 
                const WebDashboardScreen(),
                fullWidth: true
              ),
              const SizedBox(height: 15),
              _buildActionCard(context, Icons.history, "SERVICE LOGS", const Color(0xFF009688), const ReportsListScreen(), fullWidth: true),
 bitumen            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String label, Color color, Widget destination, {bool fullWidth = false}) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => destination)),
      child: Container(
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0x08FFFFFF),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0x1AFFFFFF)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
      ),
    );
  }
}
