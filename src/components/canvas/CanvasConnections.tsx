'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { NodeConnection, CanvasNode, AnchorPosition } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface CanvasConnectionsProps {
  connections: NodeConnection[];
  nodes: CanvasNode[];
  onConnectionDelete: (connectionId: number) => void;
  newConnectionId?: number | null; // ID of newly created connection to animate
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

// Animated traveling dot component for new connections
function TravelingDot({
  pathD,
  pathId,
  onAnimationComplete,
}: {
  pathD: string;
  pathId: string;
  onAnimationComplete: () => void;
}) {
  const dotRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Trigger animation complete after the animation duration
    const timer = setTimeout(onAnimationComplete, 1200);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <g className="pointer-events-none">
      {/* Outer glow trail */}
      <circle ref={glowRef} r={12} fill="url(#dotGlow)" opacity={0.6}>
        <animateMotion
          dur="1s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
        <animate
          attributeName="r"
          values="8;14;10"
          dur="1s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          values="0;0.8;0.4;0"
          dur="1.2s"
          fill="freeze"
        />
      </circle>

      {/* Core traveling dot */}
      <circle ref={dotRef} r={6} fill="url(#dotCore)">
        <animateMotion
          dur="1s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
        <animate
          attributeName="r"
          values="4;7;5"
          dur="1s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="1.2s"
          fill="freeze"
        />
      </circle>

      {/* Inner bright core */}
      <circle r={3} fill="#ffffff">
        <animateMotion
          dur="1s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="1.2s"
          fill="freeze"
        />
      </circle>
    </g>
  );
}

// Ripple effect at connection endpoints
function EndpointRipple({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g className="pointer-events-none">
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={4}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          opacity={0}
        >
          <animate
            attributeName="r"
            values="4;24"
            dur="0.8s"
            begin={`${delay + i * 0.15}s`}
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            values="0;0.6;0"
            dur="0.8s"
            begin={`${delay + i * 0.15}s`}
            fill="freeze"
          />
          <animate
            attributeName="stroke-width"
            values="2;0.5"
            dur="0.8s"
            begin={`${delay + i * 0.15}s`}
            fill="freeze"
          />
        </circle>
      ))}
    </g>
  );
}

// Success checkmark that appears at the end of connection
function ConnectionSuccess({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g className="pointer-events-none" transform={`translate(${x}, ${y})`}>
      {/* Background circle */}
      <circle
        r={0}
        fill="hsl(var(--primary))"
        opacity={0}
      >
        <animate
          attributeName="r"
          values="0;14;12"
          dur="0.4s"
          begin={`${delay}s`}
          fill="freeze"
          calcMode="spline"
          keySplines="0.175 0.885 0.32 1.275;0.6 0 0.4 1"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="1.5s"
          begin={`${delay}s`}
          fill="freeze"
        />
      </circle>

      {/* Checkmark */}
      <path
        d="M-4,0 L-1,3 L4,-3"
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
        strokeDasharray="12"
        strokeDashoffset="12"
      >
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="1.5s"
          begin={`${delay + 0.2}s`}
          fill="freeze"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="12;0"
          dur="0.3s"
          begin={`${delay + 0.2}s`}
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
        />
      </path>
    </g>
  );
}

// Particle trail effect following the dot (one-time animation for new connections)
function ParticleTrail({ pathId, delay = 0 }: { pathId: string; delay?: number }) {
  return (
    <g className="pointer-events-none">
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          r={3 - i * 0.5}
          fill="hsl(var(--primary))"
          opacity={0}
        >
          <animateMotion
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            begin={`${delay + i * 0.05}s`}
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.3;0.2;0"
            dur="1s"
            begin={`${delay + i * 0.05}s`}
            fill="freeze"
          />
          <animate
            attributeName="r"
            values="2;1"
            dur="1s"
            begin={`${delay + i * 0.05}s`}
            fill="freeze"
          />
        </circle>
      ))}
    </g>
  );
}

// Continuous flowing particles - always visible on connections
function ContinuousFlowParticles({
  pathId,
  color = "hsl(var(--primary))"
}: {
  pathId: string;
  color?: string;
}) {
  // Create multiple particle groups with staggered start times for continuous flow
  const particleGroups = [0, 1, 2];
  const particlesPerGroup = 3;
  const cycleDuration = 4; // seconds for full cycle
  const staggerDelay = cycleDuration / particleGroups.length;

  return (
    <g className="pointer-events-none">
      {particleGroups.map((groupIndex) => (
        <g key={groupIndex}>
          {Array.from({ length: particlesPerGroup }).map((_, i) => {
            const particleDelay = (i * 0.15) + (groupIndex * staggerDelay);
            const size = 3 - i * 0.5;

            return (
              <circle
                key={`${groupIndex}-${i}`}
                r={size}
                fill={color}
                opacity={0}
              >
                <animateMotion
                  dur={`${cycleDuration}s`}
                  repeatCount="indefinite"
                  begin={`${particleDelay}s`}
                  calcMode="spline"
                  keySplines="0.25 0.1 0.25 1"
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;0.25;0.2;0.15;0"
                  keyTimes="0;0.1;0.5;0.9;1"
                  dur={`${cycleDuration}s`}
                  repeatCount="indefinite"
                  begin={`${particleDelay}s`}
                />
                <animate
                  attributeName="r"
                  values={`${size};${size * 0.8};${size * 0.6}`}
                  keyTimes="0;0.5;1"
                  dur={`${cycleDuration}s`}
                  repeatCount="indefinite"
                  begin={`${particleDelay}s`}
                />
              </circle>
            );
          })}
        </g>
      ))}

      {/* Lead particle - slightly larger and brighter */}
      {particleGroups.map((groupIndex) => (
        <circle
          key={`lead-${groupIndex}`}
          r={4}
          fill={color}
          opacity={0}
          filter="url(#particleGlow)"
        >
          <animateMotion
            dur={`${cycleDuration}s`}
            repeatCount="indefinite"
            begin={`${groupIndex * staggerDelay}s`}
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.4;0.35;0.25;0"
            keyTimes="0;0.1;0.5;0.9;1"
            dur={`${cycleDuration}s`}
            repeatCount="indefinite"
            begin={`${groupIndex * staggerDelay}s`}
          />
          <animate
            attributeName="r"
            values="4;3.5;2.5"
            keyTimes="0;0.5;1"
            dur={`${cycleDuration}s`}
            repeatCount="indefinite"
            begin={`${groupIndex * staggerDelay}s`}
          />
        </circle>
      ))}
    </g>
  );
}

function ConnectionLine({
  connection,
  sourceNode,
  targetNode,
  onDelete,
  isNew = false,
  onAnimationComplete,
}: {
  connection: NodeConnection;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  onDelete: () => void;
  isNew?: boolean;
  onAnimationComplete?: () => void;
}) {
  const [showAnimation, setShowAnimation] = useState(isNew);
  const pathId = `connection-path-${connection.id}`;

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

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    onAnimationComplete?.();
  };

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

      {/* Path glow effect for new connections */}
      {showAnimation && (
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0}
          className="pointer-events-none"
        >
          <animate
            attributeName="opacity"
            values="0;0.4;0"
            dur="1.2s"
            fill="freeze"
          />
          <animate
            attributeName="stroke-width"
            values="2;8;4"
            dur="1.2s"
            fill="freeze"
          />
        </path>
      )}

      {/* Define path for animation reference */}
      <path
        id={pathId}
        d={pathD}
        fill="none"
        stroke="none"
      />

      {/* Visible path with draw animation for new connections */}
      {showAnimation ? (
        <>
          {/* Background path (appears immediately but faded) */}
          <path
            d={pathD}
            fill="none"
            stroke={connection.color}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.15}
          />

          {/* Animated drawing path */}
          <path
            d={pathD}
            fill="none"
            stroke={connection.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset="2000"
            className="transition-all group-hover:stroke-primary group-hover:stroke-[3px]"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="2000;0"
              dur="1s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </path>
        </>
      ) : (
        <path
          d={pathD}
          fill="none"
          stroke={connection.color}
          strokeWidth={2}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all group-hover:stroke-primary group-hover:stroke-[3px]"
        />
      )}

      {/* Continuous flowing particles - always visible */}
      <ContinuousFlowParticles pathId={pathId} color={connection.color} />

      {/* Arrow at the end */}
      <polygon
        points={`${end.x},${end.y} ${end.x - 8},${end.y - 4} ${end.x - 8},${end.y + 4}`}
        fill={connection.color}
        transform={`rotate(${Math.atan2(end.y - controlPoints[1].y, end.x - controlPoints[1].x) * (180 / Math.PI)}, ${end.x}, ${end.y})`}
        className="transition-all group-hover:fill-primary"
      />

      {/* Traveling dot animation for new connections */}
      {showAnimation && (
        <>
          {/* Particle trail behind the dot */}
          <ParticleTrail pathId={pathId} delay={0.05} />

          {/* Main traveling dot */}
          <TravelingDot
            pathD={pathD}
            pathId={pathId}
            onAnimationComplete={handleAnimationComplete}
          />

          {/* Ripple effects at endpoints */}
          <EndpointRipple x={start.x} y={start.y} delay={0} />
          <EndpointRipple x={end.x} y={end.y} delay={0.85} />

          {/* Success indicator at the end */}
          <ConnectionSuccess x={end.x} y={end.y} delay={0.95} />
        </>
      )}

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
  newConnectionId,
}: CanvasConnectionsProps) {
  const [animatingConnectionIds, setAnimatingConnectionIds] = useState<Set<number>>(new Set());
  const prevConnectionsRef = useRef<NodeConnection[]>([]);

  // Track new connections for animation
  useEffect(() => {
    const prevIds = new Set(prevConnectionsRef.current.map(c => c.id));
    const newConnections = connections.filter(c => !prevIds.has(c.id));

    if (newConnections.length > 0) {
      setAnimatingConnectionIds(prev => {
        const next = new Set(prev);
        newConnections.forEach(c => next.add(c.id));
        return next;
      });
    }

    prevConnectionsRef.current = connections;
  }, [connections]);

  // Also handle explicit newConnectionId prop
  useEffect(() => {
    if (newConnectionId && !animatingConnectionIds.has(newConnectionId)) {
      setAnimatingConnectionIds(prev => new Set(prev).add(newConnectionId));
    }
  }, [newConnectionId, animatingConnectionIds]);

  const handleAnimationComplete = (connectionId: number) => {
    setAnimatingConnectionIds(prev => {
      const next = new Set(prev);
      next.delete(connectionId);
      return next;
    });
  };

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
      {/* Gradient definitions for animated dot */}
      <defs>
        {/* Primary glow gradient */}
        <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>

        {/* Core dot gradient */}
        <radialGradient id="dotCore" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        </radialGradient>

        {/* Filter for glow effect */}
        <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle glow for flowing particles */}
        <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

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

          const isNew = animatingConnectionIds.has(connection.id);

          return (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              sourceNode={sourceNode}
              targetNode={targetNode}
              onDelete={() => onConnectionDelete(connection.id)}
              isNew={isNew}
              onAnimationComplete={() => handleAnimationComplete(connection.id)}
            />
          );
        })}
      </g>

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes connectionAppear {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            opacity: 0.3;
          }
          100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  );
}
