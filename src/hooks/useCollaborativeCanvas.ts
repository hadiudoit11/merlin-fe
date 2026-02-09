'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} from '@/lib/liveblocks.config';
import { CanvasNode } from '@/types/canvas';

interface UseCollaborativeCanvasOptions {
  canvasRef: React.RefObject<HTMLElement>;
  viewport: { x: number; y: number; zoom: number };
  onRemoteNodeMove?: (nodeId: number, x: number, y: number) => void;
}

interface UseCollaborativeCanvasReturn {
  // Presence
  updateCursor: (x: number, y: number) => void;
  clearCursor: () => void;
  updateSelectedNodes: (nodeIds: number[]) => void;

  // Others' state
  othersSelectedNodes: Map<number, { connectionId: number; color: string; name: string }[]>;

  // Events
  broadcastNodeMove: (nodeId: number, x: number, y: number) => void;
  broadcastNodeCreate: (nodeId: number) => void;
  broadcastNodeDelete: (nodeId: number) => void;
}

/**
 * Hook for real-time canvas collaboration.
 * Handles cursor tracking, selection sync, and node movement broadcasting.
 */
export function useCollaborativeCanvas({
  canvasRef,
  viewport,
  onRemoteNodeMove,
}: UseCollaborativeCanvasOptions): UseCollaborativeCanvasReturn {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const broadcast = useBroadcastEvent();

  // Track mouse position and convert to canvas coordinates
  const updateCursor = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      // Convert screen coordinates to canvas coordinates
      const x = (clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (clientY - rect.top - viewport.y) / viewport.zoom;

      updateMyPresence({ cursor: { x, y } });
    },
    [canvasRef, viewport, updateMyPresence]
  );

  const clearCursor = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const updateSelectedNodes = useCallback(
    (nodeIds: number[]) => {
      updateMyPresence({ selectedNodeIds: nodeIds });
    },
    [updateMyPresence]
  );

  // Build map of which nodes are selected by which users
  const othersSelectedNodes = new Map<
    number,
    { connectionId: number; color: string; name: string }[]
  >();

  others.forEach(({ connectionId, presence, info }) => {
    const selectedIds = presence?.selectedNodeIds || [];
    const color = info?.color || presence?.user?.color || '#888888';
    const name = info?.name || presence?.user?.name || 'Anonymous';

    selectedIds.forEach((nodeId) => {
      if (!othersSelectedNodes.has(nodeId)) {
        othersSelectedNodes.set(nodeId, []);
      }
      othersSelectedNodes.get(nodeId)!.push({ connectionId, color, name });
    });
  });

  // Broadcast events
  const broadcastNodeMove = useCallback(
    (nodeId: number, x: number, y: number) => {
      broadcast({ type: 'NODE_UPDATED', nodeId });
    },
    [broadcast]
  );

  const broadcastNodeCreate = useCallback(
    (nodeId: number) => {
      broadcast({ type: 'NODE_CREATED', nodeId });
    },
    [broadcast]
  );

  const broadcastNodeDelete = useCallback(
    (nodeId: number) => {
      broadcast({ type: 'NODE_DELETED', nodeId });
    },
    [broadcast]
  );

  // Listen for remote events
  useEventListener(({ event }) => {
    switch (event.type) {
      case 'NODE_UPDATED':
        // Trigger a refresh of the specific node
        console.log('Remote node updated:', event.nodeId);
        break;
      case 'NODE_CREATED':
        console.log('Remote node created:', event.nodeId);
        break;
      case 'NODE_DELETED':
        console.log('Remote node deleted:', event.nodeId);
        break;
    }
  });

  return {
    updateCursor,
    clearCursor,
    updateSelectedNodes,
    othersSelectedNodes,
    broadcastNodeMove,
    broadcastNodeCreate,
    broadcastNodeDelete,
  };
}

/**
 * Hook to show selection highlights for nodes selected by other users.
 */
export function useNodeSelectionHighlight(
  nodeId: number,
  othersSelectedNodes: Map<number, { connectionId: number; color: string; name: string }[]>
): { isSelectedByOthers: boolean; selectors: { color: string; name: string }[] } {
  const selectors = othersSelectedNodes.get(nodeId) || [];

  return {
    isSelectedByOthers: selectors.length > 0,
    selectors: selectors.map(({ color, name }) => ({ color, name })),
  };
}
