import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/complaint_provider.dart';

class ComplaintListScreen extends StatefulWidget {
  const ComplaintListScreen({super.key});

  @override
  State<ComplaintListScreen> createState() => _ComplaintListScreenState();
}

class _ProjectPriorityGlow extends StatelessWidget {
  final String priority;
  final Widget child;
  const _ProjectPriorityGlow({required this.priority, required this.child});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (priority.toLowerCase()) {
      case 'high': color = Colors.red; break;
      case 'medium': color = Colors.orange; break;
      case 'low': color = Colors.blue; break;
      default: color = Colors.white10;
    }

    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.05),
            blurRadius: 20,
            spreadRadius: 2,
          )
        ],
      ),
      child: child,
    );
  }
}

class _ComplaintListScreenState extends State<ComplaintListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ComplaintProvider>().fetchComplaints();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ComplaintProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "TICKET REGISTRY",
          style: GoogleFonts.outfit(
            color: const Color(0xFF00A1E4),
            fontWeight: FontWeight.w900,
            letterSpacing: 4,
            fontSize: 12,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.refresh(),
        color: const Color(0xFF00A1E4),
        backgroundColor: const Color(0xFF040814),
        child: provider.isLoading && provider.complaints.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
          : provider.complaints.isEmpty
            ? _buildEmptyState()
            : ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                physics: const BouncingScrollPhysics(),
                itemCount: provider.complaints.length,
                itemBuilder: (context, index) {
                  final complaint = provider.complaints[index];
                  return _buildComplaintCard(complaint, index);
                },
              ),
      ),
    );
  }

  Widget _buildComplaintCard(Map<String, dynamic> ticket, int index) {
    final status = ticket['status'] ?? 'Open';
    final priority = ticket['priority'] ?? 'Medium';
    
    return FadeInUp(
      delay: Duration(milliseconds: index * 100),
      child: _ProjectPriorityGlow(
        priority: priority,
        child: Container(
          margin: const EdgeInsets.only(bottom: 20),
          child: GlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildPriorityBadge(priority),
                    _buildStatusBadge(status),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  ticket['title']?.toUpperCase() ?? "UNTITLED ISSUE",
                  style: GoogleFonts.outfit(
                    color: Colors.white, 
                    fontWeight: FontWeight.w900, 
                    fontSize: 15,
                    letterSpacing: 0.5
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  ticket['description'] ?? "No description provided.",
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
                const SizedBox(height: 16),
                Container(height: 1, color: Colors.white.withOpacity(0.05)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(Icons.business_rounded, color: const Color(0xFF00A1E4).withOpacity(0.5), size: 14),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        ticket['projectName'] ?? "General",
                        style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Text(
                      _formatDate(ticket['createdAt']),
                      style: const TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(String priority) {
    Color color;
    switch (priority.toLowerCase()) {
      case 'high': color = Colors.red; break;
      case 'medium': color = Colors.orange; break;
      default: color = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        priority.toUpperCase(),
        style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.black, letterSpacing: 1),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final isClosed = status.toLowerCase() == 'closed' || status.toLowerCase() == 'resolved';
    final color = isClosed ? Colors.emerald : Colors.amber;

    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          status.toUpperCase(),
          style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return "N/A";
    final date = DateTime.parse(dateStr);
    return DateFormat('dd MMM yyyy').format(date);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.confirmation_number_outlined, size: 64, color: Colors.white.withOpacity(0.05)),
          const SizedBox(height: 16),
          Text(
            "NO TICKETS RECORDED",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
