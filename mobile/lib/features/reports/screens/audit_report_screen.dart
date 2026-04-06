import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../models/unit_model.dart';
import '../../../services/sync_service.dart';
import '../../../services/location_service.dart';

class AuditReportScreen extends StatefulWidget {
  final UnitModel unit;

  const AuditReportScreen({super.key, required this.unit});

  @override
  State<AuditReportScreen> createState() => _AuditReportScreenState();
}

class _AuditReportScreenState extends State<AuditReportScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  final SyncService _syncService = SyncService();
  final LocationService _locationService = LocationService();
  final ImagePicker _picker = ImagePicker();

  // Step 1: Environment
  final TextEditingController _roomTempController = TextEditingController();
  bool isAreaClean = true;

  // Step 2: Functionality
  bool blowerOk = true;
  bool compOk = true;
  bool condenserOk = true;

  // Step 3: Photos & Notes
  File? _auditImage;
  final TextEditingController _notesController = TextEditingController();

  Future<void> _takePicture() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 60,
    );

    if (photo != null) {
      setState(() => _auditImage = File(photo.path));
    }
  }

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
      'unit_tag': widget.unit.tagNumber,
      'type': 'Audit',
      'latitude': position?.latitude,
      'longitude': position?.longitude,
      'environment': {
        'room_temp': _roomTempController.text,
        'area_clean': isAreaClean,
      },
      'functionality': {
        'blower_ok': blowerOk,
        'compressor_ok': compOk,
        'condenser_ok': condenserOk,
      },
      'photo_path': _auditImage?.path,
      'notes': _notesController.text,
    };

    await _syncService.queueReport('/reports/submit', payload);

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Audit Report Saved & Queued for Sync")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Unit Audit Checklist", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.teal,
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
                color: isActive ? Colors.tealAccent : Colors.white24,
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
        const Text("Environmental Audit", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        _buildTextField("Room Temp (°C)", _roomTempController, TextInputType.number),
        const SizedBox(height: 20),
        _buildSwitch("Area is Clean and Clear", isAreaClean, (v) => setState(() => isAreaClean = v)),
      ],
    );
  }

  Widget _buildStep2() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text("System Functionality Check", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        _buildSwitch("Blower Operation Normal", blowerOk, (v) => setState(() => blowerOk = v)),
        _buildSwitch("Compressor Sound Normal", compOk, (v) => setState(() => compOk = v)),
        _buildSwitch("Condenser Fan Normal", condenserOk, (v) => setState(() => condenserOk = v)),
      ],
    );
  }

  Widget _buildStep3() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text("Evidence & Documentation", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        GestureDetector(
          onTap: _takePicture,
          child: Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.2), style: BorderStyle.solid),
              image: _auditImage != null 
                  ? DecorationImage(image: FileImage(_auditImage!), fit: BoxFit.cover)
                  : null,
            ),
            child: _auditImage == null 
                ? const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.camera_alt, color: Colors.white38, size: 40),
                      SizedBox(height: 10),
                      Text("ATTACH PHOTO", style: TextStyle(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 12))
                    ],
                  )
                : null,
          ),
        ),
        const SizedBox(height: 20),
        _buildTextField("Remarks", _notesController, TextInputType.multiline, maxLines: 4),
      ],
    );
  }

  Widget _buildTextField(String hint, TextEditingController controller, TextInputType type, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      keyboardType: type,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: maxLines == 1 ? hint : null,
        hintText: maxLines > 1 ? hint : null,
        labelStyle: const TextStyle(color: Colors.white38),
        hintStyle: const TextStyle(color: Colors.white38),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildSwitch(String title, bool value, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.fromLTRB(20, 8, 8, 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 13)),
          Switch(value: value, onChanged: onChanged, activeColor: Colors.tealAccent),
        ],
      ),
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
              backgroundColor: Colors.teal,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            ),
            child: _isSubmitting
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(_currentStep < 2 ? "NEXT STEP" : "SUBMIT AUDIT", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
