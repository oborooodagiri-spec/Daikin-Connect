import 'package:flutter/material.dart';

class ReportsListScreen extends StatelessWidget {
  const ReportsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Master Service Log", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF040814),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFF040814),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 10,
        itemBuilder: (context, index) {
          return _buildReportItem(index);
        },
      ),
    );
  }

  Widget _buildReportItem(int index) {
    bool isCorrective = index % 2 == 0;
    Color statusColor = isCorrective ? const Color(0xFFFF5252) : const Color(0xFF009688);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x0DFFFFFF)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Color.fromARGB(26, statusColor.red, statusColor.green, statusColor.blue),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCorrective ? Icons.construction : Icons.cleaning_services,
              color: statusColor,
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
                  style: const TextStyle(color: Color(0x61FFFFFF), fontSize: 11),
                ),
              ],
            ),
          ),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text("24 Oct", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
              Text("2026", style: TextStyle(color: Color(0x3DFFFFFF), fontSize: 9)),
            ],
          )
        ],
      ),
    );
  }
}
