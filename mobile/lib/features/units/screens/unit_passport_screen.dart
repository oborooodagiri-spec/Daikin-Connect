import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/unit_model.dart';
import '../../reports/screens/corrective_report_screen.dart';
import '../../reports/screens/preventive_report_screen.dart';
import '../../reports/screens/audit_report_screen.dart';
import '../../chat/screens/chat_thread_screen.dart';

class UnitPassportScreen extends StatefulWidget {
  final UnitModel asset;

  const UnitPassportScreen({super.key, required this.asset});

  @override
  State<UnitPassportScreen> createState() => _UnitPassportScreenState();
}

class _UnitPassportScreenState extends State<UnitPassportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isTech = auth.isTechnician;

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _getStatusColor(widget.asset.status).withOpacity(0.08),
              ),
            ),
          ),

          SafeArea(
            child: NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return [
                  _buildSliverHeader(context),
                  _buildSliverStats(),
                  _buildSliverTabs(),
                ];
              },
              body: TabBarView(
                controller: _tabController,
                children: [
                  _buildInfoTab(),
                  _buildHistoryTab(),
                  _buildReportsTab(context, isTech),
                  ChatThreadScreen(unit: widget.asset),
                  _buildSpecsTab(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverHeader(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 10),
        child: Row(
          children: [
            InkWell(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
              ),
            ),
            const SizedBox(width: 20),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "ASSET PASSPORT",
                  style: GoogleFonts.outfit(
                    color: const Color(0xFF00A1E4),
                    fontWeight: FontWeight.w900,
                    letterSpacing: 4,
                    fontSize: 10,
                  ),
                ),
                Text(
                  widget.asset.unitTag.toUpperCase(),
                  style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22),
                ),
              ],
            ),
            const Spacer(),
            _buildStatusBadge(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    final color = _getStatusColor(widget.asset.status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        widget.asset.status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1),
      ),
    );
  }

  Widget _buildSliverStats() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
        child: Row(
          children: [
            _buildMiniStat("HEALTH", "98%", Colors.emerald),
            const SizedBox(width: 12),
            _buildMiniStat("MTBF", "420H", Colors.blue),
            const SizedBox(width: 12),
            _buildMiniStat("UPTIME", "99.9%", Colors.amber),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, Color color) {
    return Expanded(
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        borderRadius: 12,
        child: Column(
          children: [
            Text(label, style: const TextStyle(color: Colors.white24, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
            const SizedBox(height: 4),
            Text(value, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w900, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildSliverTabs() {
    return SliverPersistentHeader(
      pinned: true,
      delegate: _SliverAppBarDelegate(
        TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: const Color(0xFF00A1E4),
          unselectedLabelColor: Colors.white24,
          indicatorColor: const Color(0xFF00A1E4),
          indicatorWeight: 3,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1.5),
          tabs: const [
            Tab(text: "OVERVIEW"),
            Tab(text: "HISTORY"),
            Tab(text: "ACTIONS"),
            Tab(text: "COMMS"),
            Tab(text: "SPECS"),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          _buildInfoSection("LOCATION MATRIX", [
            _buildInfoRow("CUSTOMER", "DAIKIN INDONESIA"),
            _buildInfoRow("PROJECT", widget.asset.projectName),
            _buildInfoRow("ROOM / TENANT", widget.asset.roomTenant),
          ]),
          const SizedBox(height: 20),
          _buildInfoSection("TECHNICAL PROFILE", [
            _buildInfoRow("BRAND", widget.asset.brand),
            _buildInfoRow("MODEL", widget.asset.model),
            _buildInfoRow("TYPE", widget.asset.unitType),
            _buildInfoRow("CAPACITY", widget.asset.capacity),
          ]),
        ],
      ),
    );
  }

  Widget _buildReportsTab(BuildContext context, bool isTech) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          if (!isTech)
            _buildWarningCard("READ-ONLY ACCESS", "Your account does not have permission to submit new reports. Contact administrator for technician privileges."),
          const SizedBox(height: 20),
          _buildActionButton(context, "CORRECTIVE REPORT", Icons.construction, Colors.red, isTech, () {
             Navigator.push(context, MaterialPageRoute(builder: (context) => CorrectiveReportScreen(unit: widget.asset)));
          }),
          const SizedBox(height: 16),
          _buildActionButton(context, "PREVENTIVE MAINTENANCE", Icons.build_rounded, Colors.blue, isTech, () {
             Navigator.push(context, MaterialPageRoute(builder: (context) => PreventiveReportScreen(unit: widget.asset)));
          }),
          const SizedBox(height: 16),
          _buildActionButton(context, "TECHNICAL AUDIT", Icons.analytics_outlined, Colors.purple, isTech, () {
             Navigator.push(context, MaterialPageRoute(builder: (context) => AuditReportScreen(unit: widget.asset)));
          }),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, String title, IconData icon, Color color, bool isTech, VoidCallback? onTap) {
    return InkWell(
      onTap: isTech ? onTap : null,
      borderRadius: BorderRadius.circular(20),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Text(
                title, 
                style: GoogleFonts.outfit(color: isTech ? Colors.white : Colors.white24, fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5)
              ),
            ),
            if (!isTech) const Icon(Icons.lock_outline, color: Colors.white12, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildWarningCard(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          const Icon(Icons.report_problem_rounded, color: Colors.amber, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 12)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(String title, List<Widget> children) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.outfit(color: const Color(0xFF00A1E4), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3)),
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white24, fontSize: 11, fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildHistoryTab() {
    return const Center(child: Text("SERVICE HISTORY LOG", style: TextStyle(color: Colors.white12, fontWeight: FontWeight.bold, letterSpacing: 2)));
  }

  Widget _buildSpecsTab() {
    return const Center(child: Text("EXTENDED SPECIFICATIONS", style: TextStyle(color: Colors.white12, fontWeight: FontWeight.bold, letterSpacing: 2)));
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'critical': return Colors.red;
      case 'warning': return Colors.amber;
      case 'normal': return Colors.emerald;
      default: return const Color(0xFF00A1E4);
    }
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverAppBarDelegate(this._tabBar);
  final TabBar _tabBar;
  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: const Color(0xFF040814),
      child: _tabBar,
    );
  }
  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
