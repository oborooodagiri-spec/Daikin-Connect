import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ReportsListScreen extends StatelessWidget {
  const ReportsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Master Service Log", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF003366),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 10, // Placeholder
        itemBuilder: (context, index) {
          return _buildReportItem(index);
        },
      ),
    );
  }

  Widget _buildReportItem(int index) {
    bool isCorrective = index % 2 == 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (isCorrective ? Colors.roseAccent : Colors.tealAccent).withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(
              isCorrective ? Icons.hammer_rounded : Icons.build_rounded, 
              color: isCorrective ? Colors.roseAccent : Colors.tealAccent,
              size: 20,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isCorrective ? "Corrective Service" : "Preventive Maintenance",
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                Text(
                  "TAG-${100 + index} • Daikin VRV X",
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text("24 Oct", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
              Text("2026", style: TextStyle(color: Colors.white24, fontSize: 9)),
            ],
          )
        ],
      ),
    );
  }
}
