import 'package:flutter/material.dart';
import '../../../models/unit_model.dart';
import '../../../services/location_service.dart';

class CorrectiveReportScreen extends StatefulWidget {
  final UnitModel unit;

  const CorrectiveReportScreen({super.key, required this.unit});

  @override
  State<CorrectiveReportScreen> createState() => _CorrectiveReportScreenState();
}

class _CorrectiveReportScreenState extends State<CorrectiveReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final LocationService _locationService = LocationService();
  
  dynamic _currentPosition;
  bool _isLocating = false;

  final TextEditingController _problemController = TextEditingController();
  final TextEditingController _actionController = TextEditingController();

  void _captureLocation() async {
    setState(() => _isLocating = true);
    final pos = await _locationService.getCurrentLocation();
    setState(() {
      _currentPosition = pos;
      _isLocating = false;
    });
  }

  void _submitReport() {
    if (_formKey.currentState!.validate()) {
      // Logic for native submission & sync queueing
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Laporan Corrective Berhasil Dikirim!")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Corrective Report", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.roseAccent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildUnitSummary(),
              const SizedBox(height: 30),
              
              _buildSectionHeader("PROBLEM DESCRIPTION"),
              _buildTextField(_problemController, "Describe the issue found..."),
              
              const SizedBox(height: 20),
              
              _buildSectionHeader("ACTION TAKEN"),
              _buildTextField(_actionController, "Describe the repair performed..."),
              
              const SizedBox(height: 30),
              
              _buildLocationPicker(),
              
              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _submitReport,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.roseAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text("SUBMIT REPORT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUnitSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.ac_unit, color: Colors.roseAccent),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.unit.tagNumber, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              Text(widget.unit.projectName, style: const TextStyle(color: Colors.white38, fontSize: 10)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title,
        style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      maxLines: 4,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white24),
        filled: true,
        fillColor: Colors.white.withOpacity(0.03),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
      ),
      validator: (v) => v!.isEmpty ? "Required" : null,
    );
  }

  Widget _buildLocationPicker() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("GEOTAG (GPS)", style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(
                "Location tagging disabled",
                style: TextStyle(color: Colors.white24, fontSize: 12),
              ),
            ],
          ),
          IconButton(
            onPressed: null,
            icon: _isLocating 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.location_off, color: Colors.white24),
          ),
        ],
      ),
    );
  }
}
