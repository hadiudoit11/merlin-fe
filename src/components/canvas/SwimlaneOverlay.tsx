"use client";

import React from "react";
import { WORKFLOW_STAGES, WorkflowStageKey } from "@/lib/workflow-api";

// Export constants for use in other components
export const SWIMLANE_HEIGHT = 400;
export const SWIMLANE_START_Y = 0;
export const SWIMLANE_LABEL_WIDTH = 140;

// Utility function to get stage from Y position
export function getStageFromY(y: number, laneHeight = SWIMLANE_HEIGHT, startY = SWIMLANE_START_Y): WorkflowStageKey | null {
  const laneIndex = Math.floor((y - startY) / laneHeight);
  if (laneIndex < 0 || laneIndex >= WORKFLOW_STAGES.length) {
    return null;
  }
  return WORKFLOW_STAGES[laneIndex].key;
}

// Utility function to get Y position for a stage
export function getYForStage(stage: WorkflowStageKey, laneHeight = SWIMLANE_HEIGHT, startY = SWIMLANE_START_Y): number {
  const index = WORKFLOW_STAGES.findIndex(s => s.key === stage);
  if (index < 0) return startY;
  return startY + index * laneHeight + laneHeight / 2;
}

interface SwimlaneOverlayProps {
  viewport: { x: number; y: number; zoom: number };
  laneHeight?: number;
  startY?: number;
}

export function SwimlaneOverlay({
  viewport,
  laneHeight = 400,
  startY = 0,
}: SwimlaneOverlayProps) {
  const stages = WORKFLOW_STAGES;
  const totalHeight = stages.length * laneHeight;

  // Calculate visible area
  const labelWidth = 140;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: "top left",
      }}
    >
      {/* Swimlane backgrounds and labels */}
      {stages.map((stage, index) => {
        const y = startY + index * laneHeight;
        const isEven = index % 2 === 0;

        return (
          <div key={stage.key} className="absolute" style={{ top: y, left: 0 }}>
            {/* Lane background */}
            <div
              className={`absolute ${isEven ? "bg-muted/20" : "bg-transparent"}`}
              style={{
                width: "10000px",
                height: laneHeight,
                left: labelWidth,
              }}
            />

            {/* Lane divider line */}
            <div
              className="absolute bg-border/40"
              style={{
                width: "10000px",
                height: 1,
                left: labelWidth,
                top: laneHeight - 1,
              }}
            />

            {/* Stage label - fixed position on left */}
            <div
              className="absolute flex items-center gap-2 pointer-events-auto"
              style={{
                width: labelWidth,
                height: laneHeight,
                left: 0,
                borderRight: "2px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            >
              <div className="flex flex-col items-center justify-center w-full px-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: getStageColor(index),
                    color: "white",
                  }}
                >
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-muted-foreground mt-2 text-center leading-tight">
                  {stage.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Top header */}
      <div
        className="absolute bg-card border-b-2 border-border flex items-center justify-center"
        style={{
          top: startY - 50,
          left: 0,
          width: labelWidth,
          height: 50,
        }}
      >
        <span className="text-sm font-semibold text-muted-foreground">
          STAGES
        </span>
      </div>
    </div>
  );
}

function getStageColor(index: number): string {
  const colors = [
    "hsl(210, 100%, 50%)", // Research - Blue
    "hsl(280, 100%, 50%)", // PRD Review - Purple
    "hsl(320, 100%, 45%)", // UX Review - Pink
    "hsl(200, 100%, 45%)", // Tech Spec - Cyan
    "hsl(45, 100%, 50%)",  // Kickoff - Yellow
    "hsl(25, 100%, 50%)",  // Development - Orange
    "hsl(0, 100%, 50%)",   // QA - Red
    "hsl(140, 70%, 45%)",  // Launch - Green
    "hsl(180, 60%, 45%)",  // Retrospective - Teal
  ];
  return colors[index] || colors[0];
}
