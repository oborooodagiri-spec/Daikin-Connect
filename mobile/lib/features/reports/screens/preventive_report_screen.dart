import 'package:flutter/material.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';
import 'package:daikin_connect_mobile/services/sync_service.dart';
import 'package:daikin_connect_mobile/services/location_service.dart';

class PreventiveReportScreen extends StatefulWidget {
  final UnitModel unit;

  const PreventiveReportScreen({super.key, required this.unit});

  @override
  State<PreventiveReportScreen> createState() => _PreventiveReportScreenState();
}

class _PreventiveReportScreenState extends State<PreventiveReportScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  final SyncService _syncService = SyncService();
  final LocationService _locationService = LocationService();

  // Step 1 Form Data
  bool filterCleaned = false;
  bool coilCleaned = false;
  bool drainChecked = false;
  bool gasChecked = false;

  // Step 2 Form Data
  final TextEditingController _voltageController = TextEditingController();
  final TextEditingController _currentController = TextEditingController();
  final TextEditingController _tempSuctionController = TextEditingController();

  // Step 3 Form Data
  final TextEditingController _notesController = TextEditingController();

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _submitReport();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  Future<void> _submitReport() async {
    setState(() => _isSubmitting = true);
    
    final position = await _locationService.getCurrentLocation();
    
    final payload = {
      'unit_id': widget.unit.id,
      'unit_tag': widget.unit.unitTag,
      'type': 'Preventive',
      'latitude': position?.latitude,
      'longitude': position?.longitude,
      'checklist': {
        'filter_cleaned': filterCleaned,
        'coil_cleaned': coilCleaned,
        'drain_checked': drainChecked,
        'gas_checked': gasChecked,
      },
      'readings': {
        'voltage': _voltageController.text,
        'current': _currentController.text,
        'suction_temp': _tempSuctionController.text,
      },
      'notes': _notesController.text,
    };

    await _syncService.queueReport('/reports/submit', payload);

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Preventive Report Saved & Queued for Sync")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        title: const Text("Preventive Checklist", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF448AFF),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (index) => setState(() => _currentStep = index),
              children: [
                _buildStep1(),
                _buildStep2(),
                _buildStep3(),
              ],
            ),
          ),
          _buildBottomControls(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (index) {
          bool isActive = index <= _currentStep;
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
              height: 4,
              decoration: BoxDecoration(
                color: isActive ? const Color(0xFF448AFF) : const Color(0x33FFFFFF),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep1() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text("Physical Condition Check", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        _buildSwitch("Air Filters Cleaned", filterCleaned, (v) => setState(() => filterCleaned = v)),
        _buildSwitch("Evaporator Coils Cleaned", coilCleaned, (v) => setState(() => coilCleaned = v)),
        _buildSwitch("Drain Line Cleared", drainChecked, (v) => setState(() => drainChecked = v)),
        _buildSwitch("Refrigerant Leak Check", gasChecked, (v) => setState(() => gasChecked = v)),
      ],
    );
  }

  Widget _buildSwitch(String title, bool value, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.fromLTRB(20, 8, 8, 8),
      decoration: BoxDecoration(
        color: const Color(0x0DFFFFFF),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          Switch(value: value, onChanged: onChanged, activeColor: const Color(0xFF448AFF)),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text("Performance Reading", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        _buildTextField("Voltage (V)", _voltageController, TextInputType.number),
        const SizedBox(height: 15),
        _buildTextField("Current (A)", _currentController, TextInputType.number),
        const SizedBox(height: 15),
        _buildTextField("Suction Temp (°C)", _tempSuctionController, TextInputType.number),
      ],
    );
  }

  Widget _buildTextField(String hint, TextEditingController controller, [TextInputType type = TextInputType.text]) {
    return TextField(
      controller: controller,
      keyboardType: type,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: hint,
        labelStyle: const TextStyle(color: Colors.white38),
        filled: true,
        fillColor: const Color(0x0DFFFFFF),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildStep3() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text("Conclusion & Notes", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        TextField(
          controller: _notesController,
          maxLines: 5,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: "Add any final observations...",
            hintStyle: const TextStyle(color: Colors.white38),
            filled: true,
            fillColor: const Color(0x0DFFFFFF),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomControls() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (_currentStep > 0)
            TextButton(
              onPressed: _isSubmitting ? null : _prevStep,
              child: const Text("BACK", style: TextStyle(color: Colors.white54, fontWeight: FontWeight.bold)),
            )
          else
            const SizedBox(),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _nextStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF448AFF),
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            ),
            child: _isSubmitting
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(_currentStep < 2 ? "NEXT STEP" : "SUBMIT & SYNC", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
