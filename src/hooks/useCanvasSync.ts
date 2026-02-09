'use client';

import { useCallback } from 'react';
import {
  isLiveblocksEnabled,
  useStorage,
  useMutation,
  useBroadcastEvent,
  useEventListener,
} from '@/lib/liveblocks.config';
import type { CanvasNodeData, ConnectionData } from '@/lib/liveblocks.config';

// Dynamic import for LiveObject
let LiveObject: any = null;
if (isLiveblocksEnabled) {
  LiveObject = require('@liveblocks/client').LiveObject;
}

interface UseCanvasSyncOptions {
  onRemoteNodeUpdate?: (nodeId: number, data: Partial<CanvasNodeData>) => void;
  onRemoteNodeCreate?: (node: CanvasNodeData) => void;
  onRemoteNodeDelete?: (nodeId: number) => void;
  onRemoteConnectionCreate?: (connection: ConnectionData) => void;
  onRemoteConnectionDelete?: (connectionId: number) => void;
}

/**
 * Hook to sync canvas nodes and connections with Liveblocks storage.
 * Provides real-time collaboration for canvas state.
 * Returns no-op functions when Liveblocks isn't configured.
 */
export function useCanvasSync({
  onRemoteNodeUpdate,
  onRemoteNodeCreate,
  onRemoteNodeDelete,
  onRemoteConnectionCreate,
  onRemoteConnectionDelete,
}: UseCanvasSyncOptions = {}) {
  // Return no-op fallback when Liveblocks isn't enabled
  if (!isLiveblocksEnabled) {
    return {
      nodes: [],
      connections: [],
      syncNodePosition: () => {},
      syncNodeData: () => {},
      syncNodeCreate: () => {},
      syncNodeDelete: () => {},
      syncConnectionCreate: () => {},
      syncConnectionDelete: () => {},
    };
  }

  return useCanvasSyncInner({
    onRemoteNodeUpdate,
    onRemoteNodeCreate,
    onRemoteNodeDelete,
    onRemoteConnectionCreate,
    onRemoteConnectionDelete,
  });
}

function useCanvasSyncInner({
  onRemoteNodeUpdate,
  onRemoteNodeCreate,
  onRemoteNodeDelete,
  onRemoteConnectionCreate,
  onRemoteConnectionDelete,
}: UseCanvasSyncOptions) {
  const broadcast = useBroadcastEvent();

  // Get nodes from storage
  const nodes = useStorage((root) => root.nodes);
  const connections = useStorage((root) => root.connections);

  // Mutation to update a node position
  const updateNodePosition = useMutation(
    ({ storage }, nodeId: number, x: number, y: number) => {
      const nodes = storage.get('nodes');
      const node = nodes.get(String(nodeId));
      if (node) {
        node.set('position_x', x);
        node.set('position_y', y);
      }
    },
    []
  );

  // Mutation to update node data
  const updateNodeData = useMutation(
    ({ storage }, nodeId: number, data: Partial<CanvasNodeData>) => {
      const nodes = storage.get('nodes');
      const node = nodes.get(String(nodeId));
      if (node) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            node.set(key as keyof CanvasNodeData, value);
          }
        });
      }
    },
    []
  );

  // Mutation to add a new node
  const addNode = useMutation(({ storage }, nodeData: CanvasNodeData) => {
    const nodes = storage.get('nodes');
    nodes.set(String(nodeData.id), new LiveObject(nodeData));
  }, []);

  // Mutation to remove a node
  const removeNode = useMutation(({ storage }, nodeId: number) => {
    const nodes = storage.get('nodes');
    nodes.delete(String(nodeId));
  }, []);

  // Mutation to add a connection
  const addConnection = useMutation(
    ({ storage }, connectionData: ConnectionData) => {
      const connections = storage.get('connections');
      connections.push(connectionData);
    },
    []
  );

  // Mutation to remove a connection
  const removeConnection = useMutation(
    ({ storage }, connectionId: number) => {
      const connections = storage.get('connections');
      const index = connections
        .toImmutable()
        .findIndex((c) => c.id === connectionId);
      if (index !== -1) {
        connections.delete(index);
      }
    },
    []
  );

  // Sync a node position and broadcast the event
  const syncNodePosition = useCallback(
    (nodeId: number, x: number, y: number) => {
      updateNodePosition(nodeId, x, y);
      broadcast({ type: 'NODE_UPDATED', nodeId });
    },
    [updateNodePosition, broadcast]
  );

  // Sync node data and broadcast
  const syncNodeData = useCallback(
    (nodeId: number, data: Partial<CanvasNodeData>) => {
      updateNodeData(nodeId, data);
      broadcast({ type: 'NODE_UPDATED', nodeId });
    },
    [updateNodeData, broadcast]
  );

  // Sync new node and broadcast
  const syncNodeCreate = useCallback(
    (nodeData: CanvasNodeData) => {
      addNode(nodeData);
      broadcast({ type: 'NODE_CREATED', nodeId: nodeData.id });
    },
    [addNode, broadcast]
  );

  // Sync node deletion and broadcast
  const syncNodeDelete = useCallback(
    (nodeId: number) => {
      removeNode(nodeId);
      broadcast({ type: 'NODE_DELETED', nodeId });
    },
    [removeNode, broadcast]
  );

  // Sync new connection and broadcast
  const syncConnectionCreate = useCallback(
    (connectionData: ConnectionData) => {
      addConnection(connectionData);
      broadcast({ type: 'CONNECTION_CREATED', connectionId: connectionData.id });
    },
    [addConnection, broadcast]
  );

  // Sync connection deletion and broadcast
  const syncConnectionDelete = useCallback(
    (connectionId: number) => {
      removeConnection(connectionId);
      broadcast({ type: 'CONNECTION_DELETED', connectionId });
    },
    [removeConnection, broadcast]
  );

  // Listen for remote events
  useEventListener(({ event }) => {
    switch (event.type) {
      case 'NODE_UPDATED':
        if (onRemoteNodeUpdate && nodes) {
          const node = nodes.get(String(event.nodeId));
          if (node) {
            onRemoteNodeUpdate(event.nodeId, node as unknown as CanvasNodeData);
          }
        }
        break;
      case 'NODE_CREATED':
        if (onRemoteNodeCreate && nodes) {
          const node = nodes.get(String(event.nodeId));
          if (node) {
            onRemoteNodeCreate(node as unknown as CanvasNodeData);
          }
        }
        break;
      case 'NODE_DELETED':
        if (onRemoteNodeDelete) {
          onRemoteNodeDelete(event.nodeId);
        }
        break;
      case 'CONNECTION_CREATED':
        if (onRemoteConnectionCreate && connections) {
          const connection = connections.find(
            (c) => c.id === event.connectionId
          );
          if (connection) {
            onRemoteConnectionCreate(connection);
          }
        }
        break;
      case 'CONNECTION_DELETED':
        if (onRemoteConnectionDelete) {
          onRemoteConnectionDelete(event.connectionId);
        }
        break;
    }
  });

  // Convert LiveMap to regular object for easy consumption
  const getNodesArray = useCallback((): CanvasNodeData[] => {
    if (!nodes) return [];
    const result: CanvasNodeData[] = [];
    nodes.forEach((node) => {
      result.push(node as unknown as CanvasNodeData);
    });
    return result;
  }, [nodes]);

  const getConnectionsArray = useCallback((): ConnectionData[] => {
    if (!connections) return [];
    return connections.map((c) => c);
  }, [connections]);

  return {
    // Storage data
    nodes: getNodesArray(),
    connections: getConnectionsArray(),

    // Sync operations
    syncNodePosition,
    syncNodeData,
    syncNodeCreate,
    syncNodeDelete,
    syncConnectionCreate,
    syncConnectionDelete,
  };
}

/**
 * Hook to initialize canvas storage from backend data.
 * Call this once when the canvas loads to populate Liveblocks storage.
 * Returns no-op functions when Liveblocks isn't configured.
 */
export function useInitializeCanvasStorage() {
  // Return no-op fallback when Liveblocks isn't enabled
  if (!isLiveblocksEnabled) {
    return {
      initializeNodes: () => {},
      initializeConnections: () => {},
    };
  }

  return useInitializeCanvasStorageInner();
}

function useInitializeCanvasStorageInner() {
  const initializeNodes = useMutation(
    ({ storage }, nodesData: CanvasNodeData[]) => {
      const nodes = storage.get('nodes');
      // Clear existing
      nodes.forEach((_, key) => nodes.delete(key));
      // Add all nodes
      nodesData.forEach((nodeData) => {
        nodes.set(String(nodeData.id), new LiveObject(nodeData));
      });
    },
    []
  );

  const initializeConnections = useMutation(
    ({ storage }, connectionsData: ConnectionData[]) => {
      const connections = storage.get('connections');
      // Clear existing
      while (connections.length > 0) {
        connections.delete(0);
      }
      // Add all connections
      connectionsData.forEach((connectionData) => {
        connections.push(connectionData);
      });
    },
    []
  );

  return {
    initializeNodes,
    initializeConnections,
  };
}
