import 'package:flutter/material.dart';
import '../../../models/unit_model.dart';
import '../../../services/unit_service.dart';
import '../../../widgets/glass_widgets.dart';
import '../screens/dashboard_home.dart';
import '../../units/screens/unit_passport_screen.dart';

class UnitRegistryScreen extends StatefulWidget {
  const UnitRegistryScreen({super.key});

  @override
  State<UnitRegistryScreen> createState() => _UnitRegistryScreenState();
}

class _UnitRegistryScreenState extends State<UnitRegistryScreen> {
  final UnitService _unitService = UnitService();
  List<UnitModel> _allUnits = [];
  List<UnitModel> _filteredUnits = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUnits();
  }

  Future<void> _loadUnits() async {
    setState(() => _isLoading = true);
    final units = await _unitService.getAllCachedUnits();
    setState(() {
      _allUnits = units;
      _filteredUnits = units;
      _isLoading = false;
    });
  }

  void _filterUnits(String query) {
    setState(() {
      _filteredUnits = _allUnits
          .where((u) =>
              u.unitTag.toLowerCase().contains(query.toLowerCase()) ||
              u.projectName.toLowerCase().contains(query.toLowerCase()) ||
              u.area.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildSearchBox(),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
                  : _filteredUnits.isEmpty
                      ? _buildEmptyState()
                      : _buildUnitList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "ASSET REGISTRY",
                style: TextStyle(
                  color: Color(0xFF00A1E4),
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                "${_allUnits.length} Units Tracked",
                style: const TextStyle(color: Colors.white60, fontSize: 13),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, py: 6),
            decoration: BoxDecoration(
              color: Colors.emerald.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.emerald.withOpacity(0.2)),
            ),
            child: const Row(
              children: [
                Icon(Icons.check_circle_outline, color: Colors.emerald, size: 14),
                SizedBox(width: 6),
                Text("OFFLINE READY", style: TextStyle(color: Colors.emerald, fontWeight: FontWeight.bold, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        opacity: 0.05,
        child: TextField(
          controller: _searchController,
          onChanged: _filterUnits,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: "Search tag, project, or area...",
            hintStyle: TextStyle(color: Colors.white24, fontSize: 14),
            border: InputBorder.none,
            icon: Icon(Icons.search, color: Color(0xFF00A1E4)),
          ),
        ),
      ),
    );
  }

  Widget _buildUnitList() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _filteredUnits.length,
      itemBuilder: (context, index) {
        final unit = _filteredUnits[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: InkWell(
                onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => UnitPassportScreen(asset: unit),
                ),
              );
            },
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              opacity: 0.03,
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00A1E4).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.ac_unit_rounded, color: Color(0xFF00A1E4)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          unit.unitTag,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          unit.projectName,
                          style: const TextStyle(color: Colors.white38, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.white12),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.white.withOpacity(0.05)),
          const SizedBox(height: 16),
          const Text("No units found", style: TextStyle(color: Colors.white24)),
        ],
      ),
    );
  }
}
