import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/dashboard_provider.dart';
import '../../../services/sync_service.dart';
import '../../units/screens/unit_registry_screen.dart';
import '../../units/screens/unit_scanner_screen.dart';
import '../../reports/screens/reports_list_screen.dart';
import '../../customers/screens/customer_list_screen.dart';
import '../../projects/screens/project_list_screen.dart';
import '../../users/screens/team_management_screen.dart';
import '../../reports/screens/complaint_list_screen.dart';
import 'analytics_screen.dart';
import 'web_dashboard_screen.dart';

class DashboardHome extends StatefulWidget {
  const DashboardHome({super.key});

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  @override
  void initState() {
    super.initState();
    // Trigger real data fetch on mount
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final dashboard = Provider.of<DashboardProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: RefreshIndicator(
        onRefresh: () => dashboard.refresh(),
        color: const Color(0xFF00A1E4),
        backgroundColor: const Color(0xFF040814),
        child: Stack(
          children: [
            // Premium Radial Background
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.topRight,
                    radius: 1.5,
                    colors: [
                      const Color(0xFF00A1E4).withOpacity(0.12),
                      const Color(0xFF040814),
                    ],
                  ),
                ),
              ),
            ),
            
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                _buildHeader(auth, dashboard),
                _buildStatsGrid(dashboard),
                _buildControlPanel(context, auth),
                _buildActivityFeed(dashboard),
                const SliverPadding(padding: EdgeInsets.only(bottom: 120)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(AuthProvider auth, DashboardProvider dashboard) {
    return SliverToBoxAdapter(
      child: FadeInDown(
        duration: const Duration(milliseconds: 800),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(26, 64, 26, 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "COMMAND CENTER",
                    style: GoogleFonts.outfit(
                      color: const Color(0xFF00A1E4),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _buildPulseIndicator(dashboard.isLoading),
                      const SizedBox(width: 10),
                      Text(
                        "HELLO, ${auth.user?['name']?.split(' ')[0]?.toUpperCase() ?? 'OPERATOR'}",
                        style: GoogleFonts.outfit(
                          color: Colors.white, 
                          fontWeight: FontWeight.w700, 
                          fontSize: 16,
                          letterSpacing: 0.5
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              _buildSyncStatus(dashboard.isLoading),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPulseIndicator(bool isLoading) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: isLoading ? Colors.amber : Colors.emerald,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: (isLoading ? Colors.amber : Colors.emerald).withOpacity(0.5), 
            blurRadius: 8,
            spreadRadius: 2
          )
        ],
      ),
    );
  }

  Widget _buildSyncStatus(bool isLoading) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      borderRadius: 100,
      opacity: 0.1,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isLoading ? Icons.sync : Icons.cloud_done_rounded, 
            color: const Color(0xFF00A1E4), 
            size: 14
          ),
          const SizedBox(width: 8),
          Text(
            isLoading ? "SYNCING..." : "LIVE",
            style: GoogleFonts.outfit(
              color: Colors.white70, 
              fontWeight: FontWeight.w800, 
              fontSize: 10,
              letterSpacing: 1
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(DashboardProvider dashboard) {
    final counts = dashboard.summaryData?['counts'] ?? {};
    final totalAssets = dashboard.summaryData?['total_assets'] ?? 0;
    
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
          _buildGlassStat(
            "TOTAL ASSETS", 
            totalAssets.toString().padLeft(2, '0'), 
            "UNITS", 
            const Color(0xFF00A1E4)
          ),
          _buildGlassStat(
            "CORRECTIVE", 
            (counts['corrective'] ?? 0).toString().padLeft(2, '0'), 
            "REPORTS", 
            const Color(0xFFFF3B30)
          ),
          _buildGlassStat(
            "PREVENTIVE", 
            (counts['preventive'] ?? 0).toString().padLeft(2, '0'), 
            "DONE", 
            const Color(0xFF34C759)
          ),
          _buildGlassStat(
            "SITE AUDITS", 
            (counts['audit'] ?? 0).toString().padLeft(2, '0'), 
            "TOTAL", 
            const Color(0xFFAF52DE)
          ),
        ]),
      ),
    );
  }

  Widget _buildGlassStat(String label, String value, String unit, Color color) {
    return FadeIn(
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label, 
              style: GoogleFonts.outfit(
                color: Colors.white38, 
                fontSize: 9, 
                fontWeight: FontWeight.w700, 
                letterSpacing: 1.5
              )
            ),
            const SizedBox(height: 6),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  value, 
                  style: GoogleFonts.outfit(
                    color: color, 
                    fontSize: 28, 
                    fontWeight: FontWeight.w900,
                    shadows: [Shadow(color: color.withOpacity(0.3), blurRadius: 15)]
                  )
                ),
                const SizedBox(width: 6),
                Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Text(
                    unit, 
                    style: GoogleFonts.outfit(
                      color: Colors.white24, 
                      fontSize: 10, 
                      fontWeight: FontWeight.w800
                    )
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlPanel(BuildContext context, AuthProvider auth) {
    final features = [
      {'title': 'REGISTRY', 'icon': Icons.inventory_2_rounded, 'color': Colors.blue, 'route': 'native_registry'},
      {'title': 'ACTIVITY', 'icon': Icons.history_edu_rounded, 'color': Colors.purple, 'route': 'native_reports'},
      {'title': 'SCANNER', 'icon': Icons.qr_code_scanner_rounded, 'color': const Color(0xFF00A1E4), 'route': 'native_scanner'},
      {
      'title': 'CLIENTS',
      'icon': Icons.business_rounded,
      'color': Colors.teal,
      'route': 'native_clients'
    },
      {
        'title': 'PLANS', 
        'icon': Icons.calendar_today_rounded, 
        'color': Colors.indigo, 
        'route': 'native_projects'
      },
      {
        'title': 'TEAM', 
        'icon': Icons.people_alt_rounded, 
        'color': Colors.orange, 
        'route': 'native_team'
      },
      {
        'title': 'ANALYTICS', 
        'icon': Icons.analytics_rounded, 
        'color': Colors.red, 
        'route': 'native_analytics'
      },
      {
        'title': 'TICKETS', 
        'icon': Icons.confirmation_number_rounded, 
        'color': Colors.amber, 
        'route': 'native_tickets'
      },
    ];

    return SliverToBoxAdapter(
      child: FadeInUp(
        duration: const Duration(milliseconds: 800),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "SYSTEM DOMAINS",
                style: GoogleFonts.outfit(
                  color: Colors.white24, 
                  fontSize: 11, 
                  fontWeight: FontWeight.w800, 
                  letterSpacing: 3
                ),
              ),
              const SizedBox(height: 20),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  mainAxisSpacing: 20,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.85,
                ),
                itemCount: features.length,
                itemBuilder: (context, index) {
                  final f = features[index];
                  final color = f['color'] as Color;
                  return InkWell(
                    onTap: () => _handleFeatureTap(f),
                    borderRadius: BorderRadius.circular(20),
                    child: Column(
                      children: [
                        Container(
                          width: 58,
                          height: 58,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [color.withOpacity(0.15), color.withOpacity(0.05)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: color.withOpacity(0.2), width: 1),
                          ),
                          child: Icon(f['icon'] as IconData, color: color, size: 26),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          f['title'] as String,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            color: Colors.white70, 
                            fontSize: 10, 
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5
                          ),
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
    } else if (feature['route'] == 'native_clients') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const CustomerListScreen()));
    } else if (feature['route'] == 'native_projects') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const ProjectListScreen()));
    } else if (feature['route'] == 'native_team') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const TeamManagementScreen()));
    } else if (feature['route'] == 'native_analytics') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const AnalyticsScreen()));
    } else if (feature['route'] == 'native_tickets') {
      Navigator.push(context, MaterialPageRoute(builder: (context) => const ComplaintListScreen()));
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

  Widget _buildActivityFeed(DashboardProvider dashboard) {
    final activities = dashboard.recentActivities;
    
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "LIVE FEED",
              style: GoogleFonts.outfit(
                color: Colors.white24, 
                fontSize: 11, 
                fontWeight: FontWeight.w800, 
                letterSpacing: 3
              ),
            ),
            const SizedBox(height: 20),
            if (activities.isEmpty && !dashboard.isLoading)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Text("NO RECENT ACTIVITIES", style: GoogleFonts.outfit(color: Colors.white12, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final a = activities[index];
                final color = _getActivityColor(a['type']);
                return _buildActivityItem(
                  "${a['type']} - ${a['unit'] ?? 'SYSTEM'}", 
                  a['project'] ?? 'GENERAL OPERATIONS', 
                  _formatTime(a['date']), 
                  _getActivityIcon(a['type']), 
                  color
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Color _getActivityColor(String type) {
    switch (type.toLowerCase()) {
      case 'corrective': return Colors.red;
      case 'audit': return Colors.purple;
      case 'preventive': return Colors.green;
      default: return Colors.blue;
    }
  }

  IconData _getActivityIcon(String type) {
    switch (type.toLowerCase()) {
      case 'corrective': return Icons.warning_rounded;
      case 'audit': return Icons.verified_user_rounded;
      case 'preventive': return Icons.build_circle_rounded;
      default: return Icons.info_rounded;
    }
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return "Unknown";
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 60) return "${difference.inMinutes}m ago";
    if (difference.inHours < 24) return "${difference.inHours}h ago";
    return DateFormat('dd MMM').format(date);
  }

  Widget _buildActivityItem(String title, String subtitle, String time, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: FadeInLeft(
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1), 
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: color.withOpacity(0.15))
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title.toUpperCase(), 
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.5)
                  ),
                  const SizedBox(height: 3),
                  Text(subtitle, style: GoogleFonts.outfit(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            Text(
              time.toUpperCase(), 
              style: GoogleFonts.outfit(color: const Color(0xFF00A1E4).withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.w900)
            ),
          ],
        ),
      ),
    );
  }
}
