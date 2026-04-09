import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/unit_provider.dart';
import '../../../models/unit_model.dart';
import 'unit_passport_screen.dart';

class UnitRegistryScreen extends StatefulWidget {
  final String? projectId;
  final String? projectName;
  
  const UnitRegistryScreen({super.key, this.projectId, this.projectName});

  @override
  State<UnitRegistryScreen> createState() => _UnitRegistryScreenState();
}

class _UnitRegistryScreenState extends State<UnitRegistryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UnitProvider>().fetchUnits(projectId: widget.projectId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final unitProvider = Provider.of<UnitProvider>(context);
    final filteredUnits = unitProvider.units.where((u) {
      final tag = u['tag_number']?.toString().toLowerCase() ?? "";
      final model = u['model']?.toString().toLowerCase() ?? "";
      final room = u['room_tenant']?.toString().toLowerCase() ?? "";
      final q = _searchQuery.toLowerCase();
      return tag.contains(q) || model.contains(q) || room.contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "ASSET REGISTRY",
              style: GoogleFonts.outfit(
                color: const Color(0xFF00A1E4),
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                fontSize: 12,
              ),
            ),
            if (widget.projectName != null)
              Text(
                widget.projectName!.toUpperCase(),
                style: GoogleFonts.outfit(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildSearchHeader(unitProvider),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => unitProvider.refresh(projectId: widget.projectId),
              color: const Color(0xFF00A1E4),
              backgroundColor: const Color(0xFF040814),
              child: unitProvider.isLoading && filteredUnits.isEmpty
                ? _buildLoadingState()
                : filteredUnits.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredUnits.length,
                      itemBuilder: (context, index) {
                        final unit = filteredUnits[index];
                        return _buildUnitCard(unit, index);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHeader(UnitProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      child: Column(
        children: [
          GlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            borderRadius: 16,
            opacity: 0.1,
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _searchQuery = v),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: "Search Tag, Model, or Room...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14),
                border: InputBorder.none,
                icon: const Icon(Icons.search, color: Color(0xFF00A1E4), size: 20),
                suffixIcon: _searchQuery.isNotEmpty 
                  ? IconButton(
                      icon: const Icon(Icons.close, color: Colors.white38, size: 16),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = "");
                      },
                    )
                  : null,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "${provider.units.length} UNITS TRACKED",
                style: GoogleFonts.outfit(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
              const Icon(Icons.filter_list_rounded, color: Colors.white24, size: 16),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUnitCard(Map<String, dynamic> unit, int index) {
    final status = unit['status']?.toString() ?? "Normal";
    final statusColor = _getStatusColor(status);

    return FadeInUp(
      delay: Duration(milliseconds: index * 50),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        child: InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(
              builder: (context) => UnitPassportScreen(asset: UnitModel.fromJson(unit))
            ));
          },
          borderRadius: BorderRadius.circular(20),
          child: GlassCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: statusColor.withOpacity(0.2)),
                  ),
                  child: Icon(Icons.ac_unit_rounded, color: statusColor, size: 26),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            unit['tag_number']?.toString().toUpperCase() ?? "TAG-N/A",
                            style: GoogleFonts.outfit(
                              color: Colors.white, 
                              fontWeight: FontWeight.w900, 
                              fontSize: 14,
                              letterSpacing: 0.5
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "${unit['brand'] ?? 'Daikin'} ${unit['model'] ?? 'N/A'}",
                        style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined, color: const Color(0xFF00A1E4), size: 12),
                          const SizedBox(width: 4),
                          Text(
                            unit['room_tenant'] ?? 'No Area',
                            style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Icon(Icons.chevron_right, color: Colors.white12),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(color: statusColor, fontSize: 8, fontWeight: FontWeight.black),
                      ),
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'critical': return Colors.red;
      case 'warning': return Colors.amber;
      case 'problem': return Colors.orange;
      case 'normal': return Colors.emerald;
      default: return const Color(0xFF00A1E4);
    }
  }

  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)));
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.ac_unit_outlined, size: 64, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 16),
          Text(
            "NO ASSETS FOUND",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
