'use client';

import React, { useMemo } from 'react';
import { NodeConnection, CanvasNode, AnchorPosition } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface CanvasConnectionsProps {
  connections: NodeConnection[];
  nodes: CanvasNode[];
  onConnectionDelete: (connectionId: number) => void;
}

interface Point {
  x: number;
  y: number;
}

function getNodeCenter(node: CanvasNode): Point {
  return {
    x: node.position_x + node.width / 2,
    y: node.position_y + node.height / 2,
  };
}

// Get the position of an anchor on a node
function getAnchorPosition(node: CanvasNode, anchor?: AnchorPosition): Point {
  const centerX = node.position_x + node.width / 2;
  const centerY = node.position_y + node.height / 2;

  switch (anchor) {
    case 'top':
      return { x: centerX, y: node.position_y };
    case 'bottom':
      return { x: centerX, y: node.position_y + node.height };
    case 'left':
      return { x: node.position_x, y: centerY };
    case 'right':
      return { x: node.position_x + node.width, y: centerY };
    case 'top-left':
      return { x: node.position_x, y: node.position_y };
    case 'top-right':
      return { x: node.position_x + node.width, y: node.position_y };
    case 'bottom-left':
      return { x: node.position_x, y: node.position_y + node.height };
    case 'bottom-right':
      return { x: node.position_x + node.width, y: node.position_y + node.height };
    default:
      // Default to right side if no anchor specified
      return { x: node.position_x + node.width, y: centerY };
  }
}

function getConnectionPoints(
  source: CanvasNode,
  target: CanvasNode,
  sourceAnchor?: AnchorPosition,
  targetAnchor?: AnchorPosition
): { start: Point; end: Point; controlPoints: [Point, Point] } {
  // If anchors are specified, use them
  if (sourceAnchor || targetAnchor) {
    const start = getAnchorPosition(source, sourceAnchor);
    const end = getAnchorPosition(target, targetAnchor);

    // Calculate bezier control points based on direction
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.3, 50);

    let controlPoint1: Point;
    let controlPoint2: Point;

    // Determine control point direction based on source anchor
    if (sourceAnchor === 'left' || sourceAnchor === 'right' || sourceAnchor === 'top-left' || sourceAnchor === 'top-right' || sourceAnchor === 'bottom-left' || sourceAnchor === 'bottom-right') {
      const xDir = sourceAnchor?.includes('left') ? -1 : 1;
      controlPoint1 = { x: start.x + curvature * xDir, y: start.y };
    } else {
      const yDir = sourceAnchor === 'top' ? -1 : 1;
      controlPoint1 = { x: start.x, y: start.y + curvature * yDir };
    }

    // Determine control point direction based on target anchor
    if (targetAnchor === 'left' || targetAnchor === 'right' || targetAnchor === 'top-left' || targetAnchor === 'top-right' || targetAnchor === 'bottom-left' || targetAnchor === 'bottom-right') {
      const xDir = targetAnchor?.includes('left') ? -1 : 1;
      controlPoint2 = { x: end.x + curvature * xDir, y: end.y };
    } else {
      const yDir = targetAnchor === 'top' ? -1 : 1;
      controlPoint2 = { x: end.x, y: end.y + curvature * yDir };
    }

    return { start, end, controlPoints: [controlPoint1, controlPoint2] };
  }

  // Legacy behavior: auto-detect best connection points
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let startX: number, startY: number, endX: number, endY: number;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      startX = source.position_x + source.width;
      startY = sourceCenter.y;
      endX = target.position_x;
      endY = targetCenter.y;
    } else {
      startX = source.position_x;
      startY = sourceCenter.y;
      endX = target.position_x + target.width;
      endY = targetCenter.y;
    }
  } else {
    if (dy > 0) {
      startX = sourceCenter.x;
      startY = source.position_y + source.height;
      endX = targetCenter.x;
      endY = target.position_y;
    } else {
      startX = sourceCenter.x;
      startY = source.position_y;
      endX = targetCenter.x;
      endY = target.position_y + target.height;
    }
  }

  const midX = (startX + endX) / 2;
  const controlPoint1: Point = { x: midX, y: startY };
  const controlPoint2: Point = { x: midX, y: endY };

  return {
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    controlPoints: [controlPoint1, controlPoint2],
  };
}

function ConnectionLine({
  connection,
  sourceNode,
  targetNode,
  onDelete,
}: {
  connection: NodeConnection;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  onDelete: () => void;
}) {
  const { start, end, controlPoints } = useMemo(
    () => getConnectionPoints(sourceNode, targetNode, connection.source_anchor, connection.target_anchor),
    [sourceNode, targetNode, connection.source_anchor, connection.target_anchor]
  );

  const pathD = `M ${start.x} ${start.y} C ${controlPoints[0].x} ${controlPoints[0].y}, ${controlPoints[1].x} ${controlPoints[1].y}, ${end.x} ${end.y}`;

  const strokeDasharray =
    connection.style === 'dashed' ? '8,4' : connection.style === 'dotted' ? '2,2' : undefined;

  // Calculate midpoint for label
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <g className="group cursor-pointer" onClick={onDelete}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />

      {/* Visible path */}
      <path
        d={pathD}
        fill="none"
        stroke={connection.color}
        strokeWidth={2}
        strokeDasharray={strokeDasharray}
        className="transition-all group-hover:stroke-primary group-hover:stroke-[3px]"
      />

      {/* Arrow at the end */}
      <polygon
        points={`${end.x},${end.y} ${end.x - 8},${end.y - 4} ${end.x - 8},${end.y + 4}`}
        fill={connection.color}
        transform={`rotate(${Math.atan2(end.y - controlPoints[1].y, end.x - controlPoints[1].x) * (180 / Math.PI)}, ${end.x}, ${end.y})`}
        className="transition-all group-hover:fill-primary"
      />

      {/* Connection label */}
      {connection.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-connection.label.length * 4}
            y={-10}
            width={connection.label.length * 8}
            height={20}
            rx={4}
            fill="hsl(var(--background))"
            stroke={connection.color}
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-foreground"
          >
            {connection.label}
          </text>
        </g>
      )}

      {/* Delete indicator on hover */}
      <g
        transform={`translate(${midX}, ${midY})`}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <circle r={10} fill="hsl(var(--destructive))" />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-destructive-foreground font-bold"
        >
          ×
        </text>
      </g>
    </g>
  );
}

export function CanvasConnections({
  connections,
  nodes,
  onConnectionDelete,
}: CanvasConnectionsProps) {
  // Create a map for quick node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<number, CanvasNode>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Calculate SVG bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position_x);
      minY = Math.min(minY, node.position_y);
      maxX = Math.max(maxX, node.position_x + node.width);
      maxY = Math.max(maxY, node.position_y + node.height);
    });

    // Add padding
    return {
      minX: minX - 100,
      minY: minY - 100,
      maxX: maxX + 100,
      maxY: maxY + 100,
    };
  }, [nodes]);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: bounds.minX,
        top: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        overflow: 'visible',
      }}
    >
      <g
        style={{
          transform: `translate(${-bounds.minX}px, ${-bounds.minY}px)`,
        }}
        className="pointer-events-auto"
      >
        {connections.map((connection) => {
          const sourceNode = nodeMap.get(connection.source_node_id);
          const targetNode = nodeMap.get(connection.target_node_id);

          if (!sourceNode || !targetNode) return null;

          return (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              sourceNode={sourceNode}
              targetNode={targetNode}
              onDelete={() => onConnectionDelete(connection.id)}
            />
          );
        })}
      </g>
    </svg>
  );
}
