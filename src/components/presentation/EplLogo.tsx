"use client";

import React from "react";
import { motion } from "framer-motion";

export function EplLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow Effect */}
      <motion.div 
        className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <svg 
        viewBox="0 0 240 80" 
        className="w-full h-auto drop-shadow-[0_0_12px_rgba(0,161,228,0.6)]"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00a1e4" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        
        {/* EPL Text */}
        <text x="10" y="45" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="url(#logo-grad)" style={{ letterSpacing: '1px' }}>EPL</text>
        
        {/* CONNECT Text */}
        <text x="70" y="45" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" style={{ letterSpacing: '1px' }}>CONNECT</text>
        
        {/* Subtitle */}
        <text x="10" y="65" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="10" fill="#ffffff" opacity="0.6" style={{ letterSpacing: '2px' }}>VALUE ENGINEERING SERVICES</text>
        
        {/* Connectivity Icon (Waves) positioned at the end of CONNECT */}
        <motion.path 
          d="M 210 32 Q 220 22 230 32" 
          stroke="#00a1e4" strokeWidth="3" fill="none" strokeLinecap="round"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path 
          d="M 215 38 Q 220 33 225 38" 
          stroke="#00a1e4" strokeWidth="3" fill="none" strokeLinecap="round"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Underline */}
        <rect x="10" y="50" width="220" height="1" fill="#ffffff" opacity="0.1" />
      </svg>

      <motion.div 
        className="absolute inset-0 border border-blue-400/10 rounded-full"
        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
