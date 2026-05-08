"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingLogo({ size = 160 }) {
  const [stage, setStage] = useState<"E" | "P" | "L">("E");

  useEffect(() => {
    const sequence = ["E", "P", "L"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % sequence.length;
      setStage(sequence[i] as any);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // EPL Colors - High Contrast
  const colorE = "#FFC107"; // Vibrant Gold
  const colorP = "#1A237E"; // Deep Navy
  const colorL = "#00B0FF"; // Bright Light Blue

  const currentLabel = stage === "E" ? "Engineering" : stage === "P" ? "Partner" : "Logistics";
  const currentColor = stage === "E" ? colorE : stage === "P" ? colorP : colorL;

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Modern Shadow Glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 blur-2xl rounded-full"
          style={{ background: currentColor }}
        />

        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Vertical Stem - ALWAYS VISIBLE */}
          <motion.rect
            x="20"
            y="15"
            width="16"
            height="70"
            rx="8"
            animate={{ fill: currentColor }}
            transition={{ duration: 0.5 }}
          />

          {/* Top Bar - Morphs into P Loop */}
          <motion.rect
            x="20"
            y="15"
            width={stage === "P" ? 50 : stage === "L" ? 16 : 60}
            height="16"
            rx="8"
            animate={{ 
              width: stage === "P" ? 50 : stage === "L" ? 16 : 60,
              fill: currentColor,
              opacity: stage === "L" ? 0 : 1
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          />

          {/* P Loop Side Bar - Only visible in P stage */}
          <motion.rect
            x="54"
            y="15"
            width="16"
            height={stage === "P" ? 40 : 0}
            rx="8"
            animate={{ 
              height: stage === "P" ? 40 : 0,
              opacity: stage === "P" ? 1 : 0,
              fill: currentColor
            }}
            transition={{ duration: 0.6, type: "spring" }}
          />

          {/* Middle Bar - Morphs into P Loop Bottom */}
          <motion.rect
            x="20"
            y="39"
            width={stage === "E" ? 50 : stage === "P" ? 50 : 16}
            height="16"
            rx="8"
            animate={{ 
              width: stage === "E" ? 50 : stage === "P" ? 50 : 16,
              fill: currentColor,
              opacity: stage === "L" ? 0 : 1
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          />

          {/* Bottom Bar - Only for E and L */}
          <motion.rect
            x="20"
            y="69"
            width={stage === "P" ? 16 : 60}
            height="16"
            rx="8"
            animate={{ 
              width: stage === "P" ? 16 : 60,
              fill: currentColor,
              opacity: stage === "P" ? 0 : 1
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          />
        </svg>
      </div>

    </div>
  );
}
