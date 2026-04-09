import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:daikin_connect_mobile/widgets/glass_widgets.dart';
import 'package:daikin_connect_mobile/providers/dashboard_provider.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dashboardProvider = Provider.of<DashboardProvider>(context);
    final trendData = dashboardProvider.trendData;

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "ANALYTICS COMMAND",
          style: GoogleFonts.outfit(
            color: const Color(0xFF00A1E4),
            fontWeight: FontWeight.bold,
            letterSpacing: 4.0,
            fontSize: 12.0,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: RefreshIndicator(
        onRefresh: () => dashboardProvider.refresh(),
        color: const Color(0xFF00A1E4),
        backgroundColor: const Color(0xFF040814),
        child: dashboardProvider.isLoading && trendData.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader("OPERATIONAL TREND", "Service volume over last 6 months"),
                  const SizedBox(height: 20),
                  _buildTrendChart(trendData),
                  const SizedBox(height: 32),
                  _buildSectionHeader("ASSET HEALTH MATRIX", "Distribution of current unit status"),
                  const SizedBox(height: 20),
                  _buildHealthDistribution(dashboardProvider.summaryData),
                  const SizedBox(height: 32),
                  _buildSectionHeader("MONTHLY KPI", "Performance metrics"),
                  const SizedBox(height: 20),
                  _buildKPIGrid(dashboardProvider.summaryData),
                  const SizedBox(height: 100), 
                ],
              ),
            ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16.0, letterSpacing: 1.0),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle.toUpperCase(),
          style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 10.0, letterSpacing: 1.0),
        ),
      ],
    );
  }

  Widget _buildTrendChart(List<dynamic> data) {
    if (data.isEmpty) return Container();

    return FadeInUp(
      child: GlassCard(
        padding: const EdgeInsets.fromLTRB(10, 30, 24, 20),
        child: SizedBox(
          height: 250,
          child: LineChart(
            LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                getDrawingHorizontalLine: (value) => FlLine(color: Colors.white.withOpacity(0.05), strokeWidth: 1.0),
              ),
              titlesData: FlTitlesData(
                show: true,
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      if (value.toInt() < 0 || value.toInt() >= data.length) return const Text("");
                      return Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          data[value.toInt()]['month'].split(" ")[0],
                          style: const TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),
                ),
                leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                _buildLineBar(data, 'audit', const Color(0xFF00A1E4)),
                _buildLineBar(data, 'preventive', Colors.green),
                _buildLineBar(data, 'corrective', Colors.red),
              ],
            ),
          ),
        ),
      ),
    );
  }

  LineChartBarData _buildLineBar(List<dynamic> data, String key, Color color) {
    return LineChartBarData(
      spots: data.asMap().entries.map((e) {
        return FlSpot(e.key.toDouble(), ((e.value[key] ?? 0) as num).toDouble());
      }).toList(),
      isCurved: true,
      color: color,
      barWidth: 3,
      isStrokeCapRound: true,
      dotData: const FlDotData(show: false),
      belowBarData: BarAreaData(
        show: true,
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [color.withOpacity(0.2), color.withOpacity(0)],
        ),
      ),
    );
  }

  Widget _buildHealthDistribution(Map<String, dynamic>? summary) {
    return FadeInUp(
      delay: const Duration(milliseconds: 200),
      child: GlassCard(
        padding: const EdgeInsets.all(24),
        child: SizedBox(
          height: 200,
          child: PieChart(
            PieChartData(
              sections: [
                PieChartSectionData(value: 85.0, color: Colors.green, title: "NORMAL", radius: 50, titleStyle: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                PieChartSectionData(value: 10.0, color: Colors.amber, title: "PENDING", radius: 50, titleStyle: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                PieChartSectionData(value: 5.0, color: Colors.red, title: "PROBLEM", radius: 50, titleStyle: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
              centerSpaceRadius: 40,
              sectionsSpace: 4,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKPIGrid(Map<String, dynamic>? summary) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildKPICard("RESOLUTION RATE", "94%", Colors.green),
        _buildKPICard("AVG RESPONSE", "2.4H", Colors.blue),
        _buildKPICard("CLIENT SAT", "4.8/5", Colors.amber),
        _buildKPICard("DOWNTIME", "0.2%", Colors.red),
      ],
    );
  }

  Widget _buildKPICard(String label, String value, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.white24, fontSize: 8.0, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.bold, fontSize: 18.0)),
        ],
      ),
    );
  }
}
