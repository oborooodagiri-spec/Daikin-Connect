import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:animate_do/animate_do.dart';
import '../../../services/unit_service.dart';
import 'unit_passport_screen.dart';
import '../../../models/unit_model.dart';

class UnitScannerScreen extends StatefulWidget {
  const UnitScannerScreen({super.key});

  @override
  State<UnitScannerScreen> createState() => _UnitScannerScreenState();
}

class _UnitScannerScreenState extends State<UnitScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  final UnitService _unitService = UnitService();
  bool _isProcessing = false;

  void _onCodeDetected(String code) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    
    _controller.stop();
    
    final result = await _unitService.getUnitByToken(code);
    
    if (result['success'] && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => UnitPassportScreen(asset: result['unit'] as UnitModel),
        ),
      );
    } else if (mounted) {
      setState(() => _isProcessing = false);
      _showError(result['message'] ?? 'Unit not found');
      _controller.start();
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Color(0xFFFF5252)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  _onCodeDetected(barcode.rawValue!);
                }
              }
            },
          ),
          _buildOverlay(),
          _buildHeader(),
        ],
      ),
    );
  }

  Widget _buildOverlay() {
    return Center(
      child: FadeIn(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF00A1E4), width: 2),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Stack(
                children: [
                  _buildCorner(0, 0, top: true),
                  _buildCorner(null, 0, top: true),
                  _buildCorner(0, null, bottom: true),
                  _buildCorner(null, null, bottom: true),
                ],
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              "PLACE QR CODE INSIDE SCANNER",
              style: TextStyle(color: Colors.white70, fontSize: 10, letterSpacing: 3, fontWeight: FontWeight.bold),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCorner(double? left, double? right, {bool top = false, bool bottom = false}) {
    return Positioned(
      top: top ? -2 : null,
      bottom: bottom ? -2 : null,
      left: left,
      right: right,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: const Color(0xFF00A1E4),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(top && left != null ? 10 : 0),
            topRight: Radius.circular(top && right != null ? 10 : 0),
            bottomLeft: Radius.circular(bottom && left != null ? 10 : 0),
            bottomRight: Radius.circular(bottom && right != null ? 10 : 0),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Positioned(
      top: 60,
      left: 20,
      right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close, color: Colors.white, size: 30),
          ),
          IconButton(
            onPressed: () => _controller.toggleTorch(),
            icon: const Icon(Icons.flashlight_on, color: Colors.white, size: 30),
          ),
        ],
      ),
    );
  }
}
