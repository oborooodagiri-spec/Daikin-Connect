import '../../../widgets/floating_nav_bar.dart';
import '../../units/screens/unit_scanner_screen.dart';
import '../../reports/screens/reports_list_screen.dart';

class DashboardHome extends StatefulWidget {
  const DashboardHome({super.key});

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  int _currentIndex = 0;

  void _onTabTapped(int index) {
    if (index == 2) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const ReportsListScreen()),
      );
    } else {
      setState(() => _currentIndex = index);
    }
  }

  void _onScannerPressed() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const UnitScannerScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: const Color(0xFF00A1E4).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          SafeArea(
            child: CustomScrollView(
              slivers: [
                _buildHeader(),
                _buildSummarySection(),
                _buildRecentActivity(),
                const SliverToBoxAdapter(child: SizedBox(height: 120)),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: FloatingNavBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        onFabTap: _onScannerPressed,
      ),
    );
  }

  Widget _buildHeader() {
    return SliverPadding(
      padding: const EdgeInsets.all(24),
      sliver: SliverToBoxAdapter(
        child: FadeInDown(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Welcome back,",
                    style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
                  ),
                  Text(
                    "Command Center",
                    style: GoogleFonts.inter(
                      color: Colors.white, 
                      fontSize: 18, 
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ],
              ),
              const CircleAvatar(
                backgroundColor: Color(0xFF00A1E4),
                child: Icon(Icons.person, color: Colors.white),
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
          childAspectRatio: 1.5,
        ),
        delegate: SliverChildListDelegate([
          _buildStatCard("Total Units", "124", Icons.ac_unit, const Color(0xFF00A1E4)),
          _buildStatCard("Pending", "8", Icons.pending_actions, Colors.orangeAccent),
          _buildStatCard("Completed", "92", Icons.check_circle_outline, Colors.tealAccent),
          _buildStatCard("Alerts", "3", Icons.warning_amber, Colors.redAccent),
        ]),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return FadeInLeft(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: color, size: 24),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return SliverPadding(
      padding: const EdgeInsets.all(24),
      sliver: SliverToBoxAdapter(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Recent Activity", style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...List.generate(3, (index) => _buildActivityItem(index)),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF00A1E4).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.history, color: Color(0xFF00A1E4), size: 18),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Maintenance Completed", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                Text("Unit TAG-${102 + index} • 2h ago", style: const TextStyle(color: Colors.white38, fontSize: 10)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.white24),
        ],
      ),
    );
  }
}
