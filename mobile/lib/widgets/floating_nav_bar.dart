import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';

class FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final VoidCallback onFabTap;

  const FloatingNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.onFabTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 30),
      height: 70,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.dashboard_outlined, Icons.dashboard),
              _buildNavItem(1, Icons.analytics_outlined, Icons.analytics),
              _buildFab(),
              _buildNavItem(2, Icons.history_outlined, Icons.history),
              _buildNavItem(3, Icons.person_outline, Icons.person),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon) {
    bool isActive = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isActive ? activeIcon : icon,
            color: isActive ? const Color(0xFF00A1E4) : Colors.white38,
            size: 26,
          ),
          if (isActive)
            Container(
              margin: const EdgeInsets.only(top: 4),
              width: 4,
              height: 4,
              decoration: const BoxDecoration(
                color: Color(0xFF00A1E4),
                shape: BoxShape.circle,
              ),
            )
        ],
      ),
    );
  }

  Widget _buildFab() {
    return GestureDetector(
      onTap: onFabTap,
      child: Container(
        height: 50,
        width: 50,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF00A1E4), Color(0xFF0055D4)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00A1E4),
              blurRadius: 15,
              spreadRadius: 2,
            )
          ],
        ),
        child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 28),
      ),
    );
  }
}

