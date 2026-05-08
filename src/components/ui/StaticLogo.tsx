"use client";

import React from "react";

export default function StaticLogo({ size = 40, className = "" }) {
  // EPL Colors - High Contrast
  const colorE = "#FFC107"; // Vibrant Gold
  const colorP = "#1A237E"; // Deep Navy
  const colorL = "#00B0FF"; // Bright Light Blue

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size * 2.5} height={size} viewBox="0 0 250 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Letter E */}
        <g>
          <rect x="0" y="15" width="16" height="70" rx="8" fill={colorE} />
          <rect x="0" y="15" width="55" height="16" rx="8" fill={colorE} />
          <rect x="0" y="42" width="45" height="16" rx="8" fill={colorE} />
          <rect x="0" y="69" width="55" height="16" rx="8" fill={colorE} />
        </g>

        {/* Letter P */}
        <g transform="translate(75, 0)">
          <rect x="0" y="15" width="16" height="70" rx="8" fill={colorP} />
          <rect x="0" y="15" width="50" height="16" rx="8" fill={colorP} />
          <rect x="34" y="15" width="16" height="40" rx="8" fill={colorP} />
          <rect x="0" y="39" width="50" height="16" rx="8" fill={colorP} />
        </g>

        {/* Letter L */}
        <g transform="translate(145, 0)">
          <rect x="0" y="15" width="16" height="70" rx="8" fill={colorL} />
          <rect x="0" y="69" width="55" height="16" rx="8" fill={colorL} />
        </g>

        {/* Text 'Connect' */}
        <text 
          x="205" 
          y="75" 
          fill="#323338" 
          className="font-black" 
          style={{ fontSize: '42px', letterSpacing: '-0.05em' }}
        >
          +
        </text>
      </svg>
    </div>
  );
}
