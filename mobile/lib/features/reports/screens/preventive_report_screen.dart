import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:daikin_connect_mobile/widgets/glass_widgets.dart';
import 'package:daikin_connect_mobile/providers/sync_provider.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';

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

  final Map<String, dynamic> _formData = {
    'mechanical': {
      'compressor_condition': 'Normal',
      'fan_operation': 'Normal',
      'drainage_check': 'Clear',
    },
    'performance': {
      'voltage_v': '220',
      'amperage_a': '5.5',
      'temp_inlet_c': '24',
      'temp_outlet_c': '12',
    },
    'environment': {
      'ambient_temp': '30',
      'area_cleanliness': 'Clean',
    },
    'functionality': {
      'remote_control': 'Working',
      'display_panel': 'Working',
    },
  };

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _pageController.animateToPage(_currentStep, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _submitReport();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.animateToPage(_currentStep, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  Future<void> _submitReport() async {
    setState(() => _isSubmitting = true);
    
    final report = {
      'type': 'Preventive',
      'unitId': widget.unit.id,
      'unitTag': widget.unit.unitTag,
      'roomTenant': widget.unit.roomTenant,
      'timestamp': DateTime.now().toIso8601String(),
      'data': _formData,
    };

    try {
      await context.read<SyncProvider>().queueReport(report);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("PM REPORT QUEUED FOR SYNC")));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("ERROR: $e")));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "PREVENTIVE SERVICE",
              style: GoogleFonts.outfit(
                color: Colors.green,
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                fontSize: 12,
              ),
            ),
            Text(widget.unit.unitTag, style: const TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildMechanicalStep(),
                _buildInstrumentationStep(),
                _buildFunctionalityStep(),
              ],
            ),
          ),
          _buildNavigation(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      child: Row(
        children: List.generate(3, (index) {
          return Expanded(
            child: Container(
              height: 4,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: index <= _currentStep ? Colors.green : Colors.white10,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContainer(String title, List<Widget> children) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1)),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }

  Widget _buildMechanicalStep() {
    return _buildStepContainer("MECHANICAL CHECKLIST", [
      _buildDropdown("Compressor Integrity", 'compressor_condition', ['Normal', 'Abnormal Noise', 'High Vibration'], section: 'mechanical'),
      const SizedBox(height: 20),
      _buildDropdown("Fan Motor Operation", 'fan_operation', ['Normal', 'Slow', 'Noisy'], section: 'mechanical'),
      const SizedBox(height: 20),
      _buildDropdown("Condensate Drainage", 'drainage_check', ['Clear', 'Restricted', 'Blocked'], section: 'mechanical'),
    ]);
  }

  Widget _buildInstrumentationStep() {
    return _buildStepContainer("TECHNICAL LOG", [
      Row(
        children: [
          Expanded(child: _buildInput("Voltage (V)", 'voltage_v', section: 'performance')),
          const SizedBox(width: 16),
          Expanded(child: _buildInput("Amperage (A)", 'amperage_a', section: 'performance')),
        ],
      ),
      const SizedBox(height: 20),
      Row(
        children: [
          Expanded(child: _buildInput("Inlet Temp (°C)", 'temp_inlet_c', section: 'performance')),
          const SizedBox(width: 16),
          Expanded(child: _buildInput("Outlet Temp (°C)", 'temp_outlet_c', section: 'performance')),
        ],
      ),
    ]);
  }

  Widget _buildFunctionalityStep() {
    return _buildStepContainer("SYSTEM VERIFICATION", [
      _buildDropdown("Remote Controller", 'remote_control', ['Working', 'Weak Battery', 'Faulty'], section: 'functionality'),
      const SizedBox(height: 20),
      _buildDropdown("Unit Display Panel", 'display_panel', ['Working', 'Flickering', 'Dead Pixels'], section: 'functionality'),
      const SizedBox(height: 32),
      Text(
        "SERVICE PROOF",
        style: TextStyle(color: Colors.green.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
      ),
      const SizedBox(height: 16),
      GlassButton(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.camera_alt_rounded, color: Colors.white.withOpacity(0.5), size: 18),
            const SizedBox(width: 12),
            const Text("ATTACH SERVICE PROOF", style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1)),
          ],
        ),
      ),
    ]);
  }

  Widget _buildInput(String label, String key, {required String section}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 10),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(border: InputBorder.none),
            onChanged: (v) => _formData[section][key] = v,
            controller: TextEditingController(text: _formData[section][key]),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown(String label, String key, List<String> options, {required String section}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 10),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _formData[section][key],
              dropdownColor: const Color(0xFF041026),
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.green),
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              items: options.map((String value) {
                return DropdownMenuItem<String>(value: value, child: Text(value.toUpperCase()));
              }).toList(),
              onChanged: (val) => setState(() => _formData[section][key] = val),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavigation() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF040814),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: GlassButton(
                  onPressed: _isSubmitting ? null : _previousStep,
                  child: const Text("BACK", style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold)),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: GlassButton(
                onPressed: _isSubmitting ? null : _nextStep,
                color: Colors.green,
                child: _isSubmitting 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(_currentStep < 2 ? "CONTINUE" : "SUBMIT REPORT", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
