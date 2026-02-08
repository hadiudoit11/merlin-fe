'use client';

import React from 'react';

interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isTemp?: boolean;
}

export function ConnectionLine({ startX, startY, endX, endY, isTemp = false }: ConnectionLineProps) {
  // Calculate control points for a smooth bezier curve
  const midX = (startX + endX) / 2;

  // Create a smooth S-curve
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  return (
    <g>
      {/* Shadow/glow for better visibility */}
      <path
        d={path}
        fill="none"
        stroke={isTemp ? "rgba(59, 130, 246, 0.3)" : "rgba(0, 0, 0, 0.1)"}
        strokeWidth={isTemp ? 4 : 3}
        strokeLinecap="round"
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={isTemp ? "#3b82f6" : "#6b7280"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={isTemp ? "5,5" : "none"}
        className={isTemp ? "animate-pulse" : ""}
      />
      {/* Arrow head at end */}
      {!isTemp && (
        <circle
          cx={endX}
          cy={endY}
          r={4}
          fill="#6b7280"
        />
      )}
    </g>
  );
}
