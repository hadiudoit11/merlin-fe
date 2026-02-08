'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragMoveEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { Viewport, CanvasNode as CanvasNodeType, NodeConnection, NodeType, AnchorPosition } from '@/types/canvas';
import { CanvasNode } from './CanvasNode';
import { CanvasConnections } from './CanvasConnections';
import { ConnectionLine } from './ConnectionLine';
// CanvasToolbar removed - now using CanvasFloatingToolbar in parent
import { CanvasContextMenu } from './CanvasContextMenu';

interface CanvasProps {
  nodes: CanvasNodeType[];
  connections: NodeConnection[];
  viewport: Viewport;
  selectedNodeIds: number[];
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  onViewportChange: (viewport: Viewport) => void;
  onNodeSelect: (nodeId: number, additive?: boolean) => void;
  onNodeMove: (nodeId: number, x: number, y: number) => void;
  onNodeResize: (nodeId: number, width: number, height: number) => void;
  onNodeUpdate: (nodeId: number, data: Partial<CanvasNodeType>) => void;
  onNodeDelete: (nodeId: number) => void;
  onNodeAdd: (type: NodeType, position: { x: number; y: number }) => void;
  onAddAgent?: (position: { x: number; y: number }) => void;
  onConnectionAdd: (sourceId: number, targetId: number, sourceAnchor?: AnchorPosition, targetAnchor?: AnchorPosition) => void;
  onConnectionDelete: (connectionId: number) => void;
  onClearSelection: () => void;
  onNodeDoubleClick?: (nodeId: number) => void;
  onAddConnectedNode?: (sourceNodeId: number, nodeType: NodeType) => void;
  onCanvasInteraction?: () => void;
  className?: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;

export function Canvas({
  nodes,
  connections,
  viewport,
  selectedNodeIds,
  gridEnabled = true,
  gridSize = 20,
  snapToGrid = true,
  onViewportChange,
  onNodeSelect,
  onNodeMove,
  onNodeResize,
  onNodeUpdate,
  onNodeDelete,
  onNodeAdd,
  onAddAgent,
  onConnectionAdd,
  onConnectionDelete,
  onClearSelection,
  onNodeDoubleClick,
  onAddConnectedNode,
  onCanvasInteraction,
  className,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<number | null>(null);
  const [connectingFromAnchor, setConnectingFromAnchor] = useState<AnchorPosition | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Configure dnd-kit sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Snap position to grid
  const snapPosition = useCallback(
    (x: number, y: number) => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize]
  );

  // Handle mouse wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      onCanvasInteraction?.();

      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom + delta * viewport.zoom));

      // Zoom towards mouse position
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scale = newZoom / viewport.zoom;
      const newX = mouseX - (mouseX - viewport.x) * scale;
      const newY = mouseY - (mouseY - viewport.y) * scale;

      onViewportChange({ x: newX, y: newY, zoom: newZoom });
    },
    [viewport, onViewportChange, onCanvasInteraction]
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onCanvasInteraction?.();

      // Only pan with middle mouse button or space+left click
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      } else if (e.button === 0 && e.target === containerRef.current) {
        // Click on empty canvas - clear selection
        onClearSelection();
      }
    },
    [viewport, onClearSelection, onCanvasInteraction]
  );

  // Handle pan move and connection drag
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        onViewportChange({
          ...viewport,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }

      // Track mouse position for connection line preview
      if (isConnecting) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setMousePosition(canvasPos);
      }
    },
    [isPanning, panStart, viewport, onViewportChange, isConnecting, screenToCanvas]
  );

  // Find which node is at a given canvas position
  const findNodeAtPosition = useCallback(
    (canvasX: number, canvasY: number): number | null => {
      // Check nodes in reverse order (top nodes first based on z-index)
      const sortedNodes = [...nodes].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));
      for (const node of sortedNodes) {
        if (
          canvasX >= node.position_x &&
          canvasX <= node.position_x + node.width &&
          canvasY >= node.position_y &&
          canvasY <= node.position_y + node.height
        ) {
          return node.id;
        }
      }
      return null;
    },
    [nodes]
  );

  // Get which anchors have connections for a given node
  const getConnectedAnchors = useCallback(
    (nodeId: number): AnchorPosition[] => {
      const anchors: AnchorPosition[] = [];
      for (const conn of connections) {
        if (conn.source_node_id === nodeId && conn.source_anchor) {
          anchors.push(conn.source_anchor);
        }
        if (conn.target_node_id === nodeId && conn.target_anchor) {
          anchors.push(conn.target_anchor);
        }
      }
      return [...new Set(anchors)]; // Remove duplicates
    },
    [connections]
  );

  // Handle pan end and complete/cancel connection
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      setIsPanning(false);

      if (isConnecting && connectingFromId !== null) {
        // Calculate which node we're over (if any)
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const targetNodeId = findNodeAtPosition(canvasPos.x, canvasPos.y);

        if (targetNodeId !== null && targetNodeId !== connectingFromId) {
          // Complete the connection
          onConnectionAdd(connectingFromId, targetNodeId);
        }
        // Reset connection state
        setIsConnecting(false);
        setConnectingFromId(null);
        setMousePosition(null);
      }
    },
    [isConnecting, connectingFromId, screenToCanvas, findNodeAtPosition, onConnectionAdd]
  );

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle adding node from context menu
  const handleAddNode = useCallback(
    (type: NodeType) => {
      if (contextMenu) {
        const canvasPos = screenToCanvas(contextMenu.x, contextMenu.y);
        const snapped = snapPosition(canvasPos.x, canvasPos.y);
        onNodeAdd(type, snapped);
      }
      closeContextMenu();
    },
    [contextMenu, screenToCanvas, snapPosition, onNodeAdd, closeContextMenu]
  );

  // Handle adding agent from context menu (opens wizard)
  const handleAddAgent = useCallback(() => {
    if (contextMenu && onAddAgent) {
      const canvasPos = screenToCanvas(contextMenu.x, contextMenu.y);
      const snapped = snapPosition(canvasPos.x, canvasPos.y);
      onAddAgent(snapped);
    }
    closeContextMenu();
  }, [contextMenu, screenToCanvas, snapPosition, onAddAgent, closeContextMenu]);

  // Handle drag end for nodes
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const nodeId = active.id as number;
      const node = nodes.find((n) => n.id === nodeId);

      if (node) {
        const newX = node.position_x + delta.x / viewport.zoom;
        const newY = node.position_y + delta.y / viewport.zoom;
        const snapped = snapPosition(newX, newY);
        onNodeMove(nodeId, snapped.x, snapped.y);
      }
    },
    [nodes, viewport.zoom, snapPosition, onNodeMove]
  );

  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: number, anchor: AnchorPosition) => {
    setIsConnecting(true);
    setConnectingFromId(nodeId);
    setConnectingFromAnchor(anchor);
  }, []);

  // Handle connection end
  const handleConnectionEnd = useCallback(
    (targetNodeId: number, anchor: AnchorPosition) => {
      if (isConnecting && connectingFromId !== null && connectingFromId !== targetNodeId) {
        onConnectionAdd(connectingFromId, targetNodeId, connectingFromAnchor || 'right', anchor);
      }
      setIsConnecting(false);
      setConnectingFromId(null);
      setConnectingFromAnchor(null);
      setMousePosition(null);
    },
    [isConnecting, connectingFromId, connectingFromAnchor, onConnectionAdd]
  );

  // Cancel connection
  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectingFromId(null);
    setConnectingFromAnchor(null);
    setMousePosition(null);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0 && document.activeElement === document.body) {
          e.preventDefault();
          selectedNodeIds.forEach((id) => onNodeDelete(id));
        }
      } else if (e.key === 'Escape') {
        onClearSelection();
        cancelConnection();
        closeContextMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, onNodeDelete, onClearSelection, cancelConnection, closeContextMenu]);

  // Grid pattern
  const gridPattern = gridEnabled ? (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
      <defs>
        <pattern
          id="grid"
          width={gridSize * viewport.zoom}
          height={gridSize * viewport.zoom}
          patternUnits="userSpaceOnUse"
          x={viewport.x % (gridSize * viewport.zoom)}
          y={viewport.y % (gridSize * viewport.zoom)}
        >
          <circle cx="1" cy="1" r="1" fill="currentColor" className="text-muted-foreground" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-background',
        isPanning && 'cursor-grabbing',
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      {/* Grid background */}
      {gridPattern}

      {/* Canvas content - transformed layer */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Connections layer */}
        <CanvasConnections
          connections={connections}
          nodes={nodes}
          onConnectionDelete={onConnectionDelete}
        />

        {/* Temporary connection line while dragging */}
        {isConnecting && connectingFromId !== null && mousePosition && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {(() => {
              const sourceNode = nodes.find(n => n.id === connectingFromId);
              if (!sourceNode) return null;
              // Start from the right side of the source node
              const startX = sourceNode.position_x + sourceNode.width;
              const startY = sourceNode.position_y + sourceNode.height / 2;
              return (
                <ConnectionLine
                  startX={startX}
                  startY={startY}
                  endX={mousePosition.x}
                  endY={mousePosition.y}
                  isTemp={true}
                />
              );
            })()}
          </svg>
        )}

        {/* Nodes layer */}
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              isConnecting={isConnecting}
              zoom={viewport.zoom}
              connectedAnchors={getConnectedAnchors(node.id)}
              onSelect={onNodeSelect}
              onUpdate={onNodeUpdate}
              onResize={onNodeResize}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              onDoubleClick={onNodeDoubleClick}
              onAddConnectedNode={onAddConnectedNode}
            />
          ))}
        </DndContext>
      </div>

      {/* Toolbar controls moved to CanvasFloatingToolbar in parent component */}

      {/* Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddNode={handleAddNode}
          onAddAgent={handleAddAgent}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
