"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface LineNavigatorProps {
  isMoving: boolean;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/**
 * LineNavigator now calculates a 'bridge' between two points.
 * It uses a stretch/squeeze effect (Comet) during movement.
 */
export function LineNavigator({ isMoving, from, to }: LineNavigatorProps) {
  // Calculate relative coordinates for the SVG viewBox (0-100)
  // We'll normalize the 'bridge' to its own SVG container
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Create a path that connects current and next scene
  // We'll use a slightly curved Bezier for that professional look
  const path = `M 50 50 L ${50 + dx} ${50 + dy}`;

  if (!isMoving) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="comet-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* The Comet Line */}
        <motion.path
          d={path}
          fill="transparent"
          stroke="#00a1e4"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ 
            pathLength: [0, 0.5, 0],
            pathOffset: [0, 0.4, 1]
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeInOut",
          }}
          style={{ filter: "url(#comet-glow)" }}
        />

        {/* The Lead Dot */}
        <motion.circle
          r="1"
          fill="#fff"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            offsetPath: `path('${path}')`,
            filter: "drop-shadow(0 0 10px #00a1e4)"
          }}
        />
      </svg>
    </div>
  );
}
