'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Canvas,
  CanvasNode,
  NodeConnection,
  Viewport,
  CreateNodeRequest,
  UpdateNodeRequest,
  CreateConnectionRequest,
  NodeType,
} from '@/types/canvas';
import { autoLayoutByHierarchy, calculateCenterViewport } from '@/lib/canvas-layout';

interface UseCanvasOptions {
  canvasId: number;
  autoSave?: boolean;
  saveDebounceMs?: number;
}

interface UseCanvasReturn {
  // Canvas state
  canvas: Canvas | null;
  nodes: CanvasNode[];
  connections: NodeConnection[];
  isLoading: boolean;
  error: string | null;

  // Viewport
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  panTo: (x: number, y: number) => void;
  zoomTo: (zoom: number, center?: { x: number; y: number }) => void;
  resetView: () => void;

  // Selection
  selectedNodeIds: number[];
  selectNode: (nodeId: number, additive?: boolean) => void;
  selectNodes: (nodeIds: number[]) => void;
  clearSelection: () => void;

  // Node operations
  addNode: (type: NodeType, position: { x: number; y: number }, name?: string) => Promise<CanvasNode | null>;
  updateNode: (nodeId: number, data: UpdateNodeRequest) => Promise<void>;
  moveNode: (nodeId: number, x: number, y: number) => void;
  moveNodes: (updates: Array<{ id: number; x: number; y: number }>) => void;
  resizeNode: (nodeId: number, width: number, height: number) => void;
  deleteNode: (nodeId: number) => Promise<void>;
  deleteSelectedNodes: () => Promise<void>;

  // Connection operations
  addConnection: (sourceId: number, targetId: number, sourceAnchor?: string, targetAnchor?: string, type?: string) => Promise<NodeConnection | null>;
  deleteConnection: (connectionId: number) => Promise<void>;

  // Canvas operations
  saveCanvas: () => Promise<void>;
  refreshCanvas: () => Promise<void>;

  // Layout
  autoLayout: () => void;
  undoLayout: () => void;
  canUndoLayout: boolean;
  fitToScreen: (containerWidth: number, containerHeight: number) => void;
}

export function useCanvas({ canvasId, autoSave = true, saveDebounceMs = 1000 }: UseCanvasOptions): UseCanvasReturn {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });

  const pendingPositionUpdates = useRef<Map<number, { x: number; y: number }>>(new Map());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Undo/Redo history for layout changes
  const [layoutHistory, setLayoutHistory] = useState<Array<{ id: number; x: number; y: number }[]>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load canvas data
  const loadCanvas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const canvasData = await api.getCanvas(canvasId);
      setCanvas(canvasData);
      setNodes(canvasData.nodes || []);
      // Extract connections from canvas response (backend now includes them)
      setConnections(canvasData.connections || []);
      setViewport({
        x: canvasData.viewport_x,
        y: canvasData.viewport_y,
        zoom: canvasData.zoom_level,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load canvas');
    } finally {
      setIsLoading(false);
    }
  }, [canvasId]);

  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  // Debounced save for position updates
  const scheduleSave = useCallback(() => {
    if (!autoSave) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingPositionUpdates.current.size > 0) {
        const updates = Array.from(pendingPositionUpdates.current.entries()).map(([id, pos]) => ({
          id,
          position_x: pos.x,
          position_y: pos.y,
        }));

        try {
          await api.batchUpdatePositions({ nodes: updates });
          pendingPositionUpdates.current.clear();
        } catch (err) {
          console.error('Failed to save positions:', err);
        }
      }
    }, saveDebounceMs);
  }, [autoSave, saveDebounceMs]);

  // Viewport operations
  const panTo = useCallback((x: number, y: number) => {
    setViewport((prev) => ({ ...prev, x, y }));
  }, []);

  const zoomTo = useCallback((zoom: number, center?: { x: number; y: number }) => {
    setViewport((prev) => {
      const newZoom = Math.max(0.1, Math.min(3, zoom));
      if (center) {
        // Zoom towards center point
        const scale = newZoom / prev.zoom;
        return {
          x: center.x - (center.x - prev.x) * scale,
          y: center.y - (center.y - prev.y) * scale,
          zoom: newZoom,
        };
      }
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  // Selection operations
  const selectNode = useCallback((nodeId: number, additive = false) => {
    setSelectedNodeIds((prev) => {
      if (additive) {
        return prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId];
      }
      return [nodeId];
    });
  }, []);

  const selectNodes = useCallback((nodeIds: number[]) => {
    setSelectedNodeIds(nodeIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  // Node operations
  const addNode = useCallback(
    async (type: NodeType, position: { x: number; y: number }, name?: string): Promise<CanvasNode | null> => {
      try {
        const nodeData: CreateNodeRequest = {
          name: name || `New ${type} node`,
          node_type: type,
          canvas_id: canvasId,
          position_x: position.x,
          position_y: position.y,
          width: type === 'doc' ? 400 : 300,
          height: type === 'doc' ? 300 : 200,
        };

        const newNode = await api.createNode(nodeData);
        setNodes((prev) => [...prev, newNode]);
        return newNode;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create node');
        return null;
      }
    },
    [canvasId]
  );

  const updateNode = useCallback(async (nodeId: number, data: UpdateNodeRequest) => {
    try {
      const updatedNode = await api.updateNode(nodeId, data);
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? updatedNode : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update node');
    }
  }, []);

  const moveNode = useCallback(
    (nodeId: number, x: number, y: number) => {
      // Update local state immediately
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, position_x: x, position_y: y } : n))
      );

      // Queue for batch save
      pendingPositionUpdates.current.set(nodeId, { x, y });
      scheduleSave();
    },
    [scheduleSave]
  );

  const moveNodes = useCallback(
    (updates: Array<{ id: number; x: number; y: number }>) => {
      // Update local state immediately
      setNodes((prev) =>
        prev.map((n) => {
          const update = updates.find((u) => u.id === n.id);
          return update ? { ...n, position_x: update.x, position_y: update.y } : n;
        })
      );

      // Queue for batch save
      updates.forEach((u) => {
        pendingPositionUpdates.current.set(u.id, { x: u.x, y: u.y });
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const resizeNode = useCallback((nodeId: number, width: number, height: number) => {
    // Update local state immediately for smooth UX
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, width, height } : n))
    );

    // Debounce the API update
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateNode(nodeId, { width, height });
      } catch (err) {
        console.error('Failed to save resize:', err);
      }
    }, saveDebounceMs);
  }, [saveDebounceMs]);

  const deleteNode = useCallback(async (nodeId: number) => {
    try {
      await api.deleteNode(nodeId);
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
      // Also remove connections involving this node
      setConnections((prev) =>
        prev.filter((c) => c.source_node_id !== nodeId && c.target_node_id !== nodeId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete node');
    }
  }, []);

  const deleteSelectedNodes = useCallback(async () => {
    try {
      await Promise.all(selectedNodeIds.map((id) => api.deleteNode(id)));
      setNodes((prev) => prev.filter((n) => !selectedNodeIds.includes(n.id)));
      setConnections((prev) =>
        prev.filter(
          (c) => !selectedNodeIds.includes(c.source_node_id) && !selectedNodeIds.includes(c.target_node_id)
        )
      );
      setSelectedNodeIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete nodes');
    }
  }, [selectedNodeIds]);

  // Connection operations
  const addConnection = useCallback(
    async (sourceId: number, targetId: number, sourceAnchor?: string, targetAnchor?: string, type = 'default'): Promise<NodeConnection | null> => {
      try {
        const connectionData: CreateConnectionRequest = {
          source_node_id: sourceId,
          target_node_id: targetId,
          source_anchor: sourceAnchor,
          target_anchor: targetAnchor,
          connection_type: type,
        };

        const newConnection = await api.createConnection(connectionData);
        setConnections((prev) => [...prev, newConnection]);
        return newConnection;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create connection');
        return null;
      }
    },
    []
  );

  const deleteConnection = useCallback(async (connectionId: number) => {
    try {
      await api.deleteConnection(connectionId);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
    }
  }, []);

  // Canvas operations
  const saveCanvas = useCallback(async () => {
    if (!canvas) return;

    try {
      await api.updateCanvas(canvasId, {
        viewport_x: viewport.x,
        viewport_y: viewport.y,
        zoom_level: viewport.zoom,
      });

      // Flush pending position updates
      if (pendingPositionUpdates.current.size > 0) {
        const updates = Array.from(pendingPositionUpdates.current.entries()).map(([id, pos]) => ({
          id,
          position_x: pos.x,
          position_y: pos.y,
        }));

        await api.batchUpdatePositions({ nodes: updates });
        pendingPositionUpdates.current.clear();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save canvas');
    }
  }, [canvas, canvasId, viewport]);

  const refreshCanvas = useCallback(async () => {
    await loadCanvas();
  }, [loadCanvas]);

  // Save current positions to history before layout changes
  const savePositionsToHistory = useCallback(() => {
    const currentPositions = nodes.map((n) => ({
      id: n.id,
      x: n.position_x,
      y: n.position_y,
    }));

    setLayoutHistory((prev) => {
      // Remove any "future" history if we've undone and are making new changes
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add current positions and limit history size
      return [...newHistory.slice(-9), currentPositions];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 9));
  }, [nodes, historyIndex]);

  // Auto-layout nodes using dagre algorithm
  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    // Save current positions before applying layout
    savePositionsToHistory();

    const result = autoLayoutByHierarchy(nodes, connections, {
      direction: 'TB',
      nodeSpacing: 80,
      rankSpacing: 120,
    });

    // Update all node positions
    moveNodes(result.nodes);
  }, [nodes, connections, moveNodes, savePositionsToHistory]);

  // Undo the last layout change
  const undoLayout = useCallback(() => {
    if (historyIndex < 0 || layoutHistory.length === 0) return;

    const previousPositions = layoutHistory[historyIndex];
    if (previousPositions) {
      moveNodes(previousPositions);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex, layoutHistory, moveNodes]);

  // Check if undo is available
  const canUndoLayout = historyIndex >= 0 && layoutHistory.length > 0;

  // Fit viewport to show all nodes
  const fitToScreen = useCallback((containerWidth: number, containerHeight: number) => {
    if (nodes.length === 0) return;

    const newViewport = calculateCenterViewport(nodes, containerWidth, containerHeight);
    setViewport(newViewport);
  }, [nodes]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    canvas,
    nodes,
    connections,
    isLoading,
    error,
    viewport,
    setViewport,
    panTo,
    zoomTo,
    resetView,
    selectedNodeIds,
    selectNode,
    selectNodes,
    clearSelection,
    addNode,
    updateNode,
    moveNode,
    moveNodes,
    resizeNode,
    deleteNode,
    deleteSelectedNodes,
    addConnection,
    deleteConnection,
    saveCanvas,
    refreshCanvas,
    autoLayout,
    undoLayout,
    canUndoLayout,
    fitToScreen,
  };
}
