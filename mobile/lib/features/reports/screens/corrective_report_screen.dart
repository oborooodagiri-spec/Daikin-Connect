import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import 'package:daikin_connect_mobile/widgets/glass_widgets.dart';
import 'package:daikin_connect_mobile/providers/sync_provider.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';

class CorrectiveReportScreen extends StatefulWidget {
  final UnitModel unit;
  const CorrectiveReportScreen({super.key, required this.unit});

  @override
  State<CorrectiveReportScreen> createState() => _CorrectiveReportScreenState();
}

class _CorrectiveReportScreenState extends State<CorrectiveReportScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  final Map<String, dynamic> _formData = {
    'problem_found': '',
    'action_taken': '',
    'parts_replaced': '',
    'status': 'Resolved',
    'recommendation': '',
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
      'type': 'Corrective',
      'unitId': widget.unit.id,
      'unitTag': widget.unit.unitTag,
      'roomTenant': widget.unit.roomTenant,
      'timestamp': DateTime.now().toIso8601String(),
      'data': _formData,
    };

    try {
      await context.read<SyncProvider>().queueReport(report);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("REPAIR LOG QUEUED FOR SYNC")),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("ERROR: $e")),
        );
      }
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
              "CORRECTIVE ACTION",
              style: GoogleFonts.outfit(
                color: const Color(0xFFFF5252),
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
                fontSize: 12,
              ),
            ),
            Text(
              widget.unit.unitTag, 
              style: const TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold)
            ),
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
                _buildProblemStep(),
                _buildActionStep(),
                _buildSummaryStep(),
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
                color: index <= _currentStep ? const Color(0xFFFF5252) : Colors.white10,
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
          Text(
            title,
            style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1),
          ),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }

  Widget _buildProblemStep() {
    return _buildStepContainer("DIAGNOSIS", [
      _buildTextArea("Found Problem / Manifestation", 'problem_found', "Describe what was broken..."),
      const SizedBox(height: 24),
      _buildTextArea("Parts / Components Replaced", 'parts_replaced', "List parts changed (if any)..."),
    ]);
  }

  Widget _buildActionStep() {
    return _buildStepContainer("REPAIR LOG", [
      _buildTextArea("Corrective Action Taken", 'action_taken', "Describe how it was fixed..."),
      const SizedBox(height: 24),
      _buildDropdown("Final Device Status", 'status', ['Resolved', 'Pending Parts', 'Unresolved']),
    ]);
  }

  Widget _buildSummaryStep() {
    return _buildStepContainer("VERIFICATION", [
      _buildTextArea("Future Recommendations", 'recommendation', "Notes for next technician..."),
      const SizedBox(height: 32),
      Text(
        "EVIDENCE CAPTURE",
        style: TextStyle(color: Colors.red.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
      ),
      const SizedBox(height: 16),
      GlassButton(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.camera_alt_rounded, color: Colors.white.withOpacity(0.5), size: 18),
            const SizedBox(width: 12),
            const Text("ATTACH REPAIR PHOTO", style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1)),
          ],
        ),
      ),
    ]);
  }

  Widget _buildTextArea(String label, String key, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 12),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            maxLines: 4,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white10),
            ),
            onChanged: (v) => _formData[key] = v,
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown(String label, String key, List<String> options) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 12),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _formData[key],
              dropdownColor: const Color(0xFF041026),
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.red),
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              items: options.map((String value) {
                return DropdownMenuItem<String>(value: value, child: Text(value.toUpperCase()));
              }).toList(),
              onChanged: (val) => setState(() => _formData[key] = val),
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
                color: const Color(0xFFFF5252),
                child: _isSubmitting 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(_currentStep < 2 ? "CONTINUE" : "LOG REPAIR", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
