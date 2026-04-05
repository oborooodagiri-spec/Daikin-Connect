import '../../../services/unit_service.dart';
import '../../../models/unit_model.dart';
import 'unit_passport_screen.dart';

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
          builder: (context) => UnitPassportScreen(unit: result['unit']),
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
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
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
                  _buildCorner(0, 0, top: true, left: true),
                  _buildCorner(null, 0, top: true, right: true),
                  _buildCorner(0, null, bottom: true, left: true),
                  _buildCorner(null, null, bottom: true, right: true),
                ],
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              "PLACE UNIT TAG INSIDE SCANNER",
              style: TextStyle(color: Colors.white70, fontSize: 10, letterSpacing: 3, fontWeight: FontWeight.bold),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCorner(double? left, double? right, {bool top = false, bool bottom = false, bool leftSide = false, bool rightSide = false}) {
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

  Widget _buildControls() {
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
