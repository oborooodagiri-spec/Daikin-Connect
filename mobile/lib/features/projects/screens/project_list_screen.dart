import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/project_provider.dart';
import '../../units/screens/unit_registry_screen.dart';

class ProjectListScreen extends StatefulWidget {
  final Map<String, dynamic>? customer;
  
  const ProjectListScreen({super.key, this.customer});

  @override
  State<ProjectListScreen> createState() => _ProjectListScreenState();
}

class _ProjectListScreenState extends State<ProjectListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectProvider>().fetchProjects(
        customerId: widget.customer?['id']
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "PROJECT EXPLORER",
              style: GoogleFonts.outfit(
                color: const Color(0xFF00A1E4),
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                fontSize: 11,
              ),
            ),
            if (widget.customer != null)
              Text(
                widget.customer!['name']?.toUpperCase() ?? "",
                style: GoogleFonts.outfit(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: RefreshIndicator(
        onRefresh: () => projectProvider.refresh(customerId: widget.customer?['id']),
        color: const Color(0xFF00A1E4),
        backgroundColor: const Color(0xFF040814),
        child: projectProvider.isLoading && projectProvider.projects.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
          : projectProvider.projects.isEmpty
            ? _buildEmptyState()
            : ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                physics: const BouncingScrollPhysics(),
                itemCount: projectProvider.projects.length,
                itemBuilder: (context, index) {
                  final project = projectProvider.projects[index];
                  return _buildProjectCard(project, index);
                },
              ),
      ),
    );
  }

  Widget _buildProjectCard(Map<String, dynamic> project, int index) {
    final statusColor = project['status'] == 'active' ? Colors.emerald : Colors.white24;

    return FadeInUp(
      delay: Duration(milliseconds: index * 100),
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        child: GlassCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: statusColor.withOpacity(0.2)),
                    ),
                    child: Text(
                      project['status']?.toUpperCase() ?? "UNKNOWN",
                      style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 1),
                    ),
                  ),
                  Text(
                    "#${project['code'] ?? 'N/A'}",
                    style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                project['name']?.toUpperCase() ?? "PROJECT NAME",
                style: GoogleFonts.outfit(
                  color: Colors.white, 
                  fontWeight: FontWeight.w900, 
                  fontSize: 16,
                  letterSpacing: 0.5
                ),
              ),
              const SizedBox(height: 6),
              if (widget.customer == null)
                Text(
                  project['customer_name']?.toUpperCase() ?? "CLIENT NAME",
                  style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              const SizedBox(height: 20),
              Container(
                height: 1,
                width: double.infinity,
                color: Colors.white.withOpacity(0.05),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatItem("UNITS", project['unit_count'].toString(), const Color(0xFF00A1E4)),
                  _buildStatItem("UPCOMING", "02", Colors.amber), // Placeholder for real upcoming tasks count
                  _buildStatItem("HEALTH", "98%", Colors.emerald), // Placeholder for real health score
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: GlassButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (context) => UnitRegistryScreen(
                        projectId: project['id'].toString(),
                        projectName: project['name'],
                      )
                    ));
                  },
                  borderRadius: 12,
                  child: Center(
                    child: Text(
                      "VIEW ASSET REGISTRY",
                      style: GoogleFonts.outfit(
                        color: const Color(0xFF00A1E4), 
                        fontWeight: FontWeight.w900, 
                        fontSize: 11,
                        letterSpacing: 1.5
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 4),
        Text(
          value, 
          style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w900, fontSize: 16),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.layers_clear_outlined, size: 64, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 16),
          Text(
            "NO PROJECTS FOUND",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
