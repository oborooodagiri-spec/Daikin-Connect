import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:daikin_connect_mobile/models/unit_model.dart';
import 'package:daikin_connect_mobile/services/sync_service.dart';
import 'package:daikin_connect_mobile/services/location_service.dart';

class ComplaintScreen extends StatefulWidget {
  final UnitModel unit;

  const ComplaintScreen({super.key, required this.unit});

  @override
  State<ComplaintScreen> createState() => _ComplaintScreenState();
}

class _ComplaintScreenState extends State<ComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final SyncService _syncService = SyncService();
  final LocationService _locationService = LocationService();
  final ImagePicker _picker = ImagePicker();

  bool _isSubmitting = false;
  File? _imageFile;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descController = TextEditingController();

  Future<void> _takePicture() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 50,
    );

    if (photo != null) {
      setState(() {
        _imageFile = File(photo.path);
      });
    }
  }

  Future<void> _submitComplaint() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    
    final position = await _locationService.getCurrentLocation();

    final payload = {
      'unit_id': widget.unit.id,
      'unit_tag': widget.unit.unitTag,
      'reporter_name': _nameController.text,
      'description': _descController.text,
      'photo_path': _imageFile?.path,
      'latitude': position?.latitude,
      'longitude': position?.longitude,
      'timestamp': DateTime.now().toIso8601String(),
    };

    await _syncService.queueReport('/reports/complaint', payload);

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Complaint logged & queued for sync!")),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        title: const Text("Report Issue", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
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
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0x0DFFFFFF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0x1AFFFFFF)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFFFAB40), size: 30),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Unit: ${widget.unit.unitTag}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text(widget.unit.projectName, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 30),
              
              _buildLabel("Reporter Name"),
              _buildTextField(_nameController, "Your Name", 1),
              
              const SizedBox(height: 20),
              
              _buildLabel("Problem Description"),
              _buildTextField(_descController, "What seems to be the issue?", 4),
              
              const SizedBox(height: 20),
              
              _buildLabel("Photographic Evidence"),
              GestureDetector(
                onTap: _takePicture,
                child: Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0x0DFFFFFF),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0x1AFFFFFF)),
                    image: _imageFile != null 
                        ? DecorationImage(image: FileImage(_imageFile!), fit: BoxFit.cover)
                        : null,
                  ),
                  child: _imageFile == null 
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.camera_alt, color: Colors.white38, size: 40),
                            SizedBox(height: 10),
                            Text("TAP TO TAKE PHOTO", style: TextStyle(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 12))
                          ],
                        )
                      : null,
                ),
              ),

              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitComplaint,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF5252),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isSubmitting 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text("SUBMIT COMPLAINT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 2)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, int maxLines) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white24),
        filled: true,
        fillColor: const Color(0x0DFFFFFF),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
      ),
      validator: (v) => v!.isEmpty ? "This field is required" : null,
    );
  }
}
