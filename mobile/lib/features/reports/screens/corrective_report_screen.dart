import 'package:flutter/material.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';
import 'package:daikin_connect_mobile/services/location_service.dart';
import 'package:daikin_connect_mobile/services/sync_service.dart';

class CorrectiveReportScreen extends StatefulWidget {
  final UnitModel unit;

  const CorrectiveReportScreen({super.key, required this.unit});

  @override
  State<CorrectiveReportScreen> createState() => _CorrectiveReportScreenState();
}

class _CorrectiveReportScreenState extends State<CorrectiveReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final LocationService _locationService = LocationService();
  final SyncService _syncService = SyncService();
  
  dynamic _currentPosition;
  bool _isLocating = false;
  bool _isSubmitting = false;

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

  void _submitReport() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      
      final payload = {
        'unit_id': widget.unit.id,
        'unit_tag': widget.unit.unitTag,
        'problem': _problemController.text,
        'action': _actionController.text,
        'location': _currentPosition?.toString() ?? 'Unknown',
        'type': 'corrective',
      };

      await _syncService.queueReport('/reports/submit', payload);
      
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Corrective Report Saved & Queued for Sync"),
            backgroundColor: Color(0xFF009688),
          ),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        title: const Text("Corrective Report", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFFFF5252),
        iconTheme: const IconThemeData(color: Colors.white),
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
                  onPressed: _isSubmitting ? null : _submitReport,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF5252),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("SUBMIT REPORT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Row(
        children: [
          const Icon(Icons.construction, color: Color(0xFFFF5252)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.unit.unitTag, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              Text(widget.unit.projectName, style: const TextStyle(color: Color(0x61FFFFFF), fontSize: 10)),
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
        style: const TextStyle(color: Color(0xFFFF5252), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2),
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
        hintStyle: const TextStyle(color: Color(0x3DFFFFFF)),
        filled: true,
        fillColor: const Color(0x0DFFFFFF),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
      ),
      validator: (v) => v!.isEmpty ? "Required" : null,
    );
  }

  Widget _buildLocationPicker() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        border: Border.all(color: const Color(0x1AFFFFFF)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("GEOTAG (GPS)", style: TextStyle(color: Color(0x8AFFFFFF), fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(
                _currentPosition != null ? "Coordinates Captured" : "Location tagging required",
                style: const TextStyle(color: Color(0x3DFFFFFF), fontSize: 12),
              ),
            ],
          ),
          IconButton(
            onPressed: _isLocating ? null : _captureLocation,
            icon: _isLocating 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Icon(
                    _currentPosition != null ? Icons.location_on : Icons.location_searching, 
                    color: _currentPosition != null ? const Color(0xFF009688) : const Color(0x3DFFFFFF)
                  ),
          ),
        ],
      ),
    );
  }
}
