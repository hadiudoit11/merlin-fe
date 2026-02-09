'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Canvas } from '@/components/canvas';
import { DocEditor } from '@/components/canvas/DocEditor';
import { AgentWizard } from '@/components/canvas/AgentWizard';
import { CanvasFloatingToolbar } from '@/components/canvas/CanvasFloatingToolbar';
import { NodeSettingsPanel } from '@/components/canvas/NodeSettingsPanel';
import { CanvasAgentPanel } from '@/components/canvas/CanvasAgentPanel';
import { isLiveblocksEnabled } from '@/lib/liveblocks.config';
import { useSession } from 'next-auth/react';
import { useCanvas } from '@/hooks/useCanvas';

// Dynamic imports for collaboration (only load if enabled)
const CollaborationRoom = isLiveblocksEnabled
  ? require('@/components/collaboration').CollaborationRoom
  : null;
const Cursors = isLiveblocksEnabled
  ? require('@/components/collaboration').Cursors
  : null;
const Collaborators = isLiveblocksEnabled
  ? require('@/components/collaboration').Collaborators
  : null;
import { NodeType, UpdateNodeRequest, AgentNodeConfig, CONNECTION_RULES } from '@/types/canvas';
import { toast } from 'sonner';

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const canvasId = Number(params?.id);

  const { data: session } = useSession();
  const userId = session?.user?.email || undefined;

  const {
    canvas,
    nodes,
    connections,
    isLoading,
    error,
    viewport,
    setViewport,
    selectedNodeIds,
    selectNode,
    clearSelection,
    addNode,
    updateNode,
    moveNode,
    resizeNode,
    deleteNode,
    addConnection,
    deleteConnection,
    saveCanvas,
    autoLayout,
    undoLayout,
    canUndoLayout,
  } = useCanvas({ canvasId });

  // Canvas container ref for collaboration cursor tracking
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Track which doc node is expanded to full-screen editor
  const [expandedNodeId, setExpandedNodeId] = useState<number | null>(null);
  const expandedNode = expandedNodeId ? nodes.find(n => n.id === expandedNodeId) : null;

  // Agent wizard state
  const [isAgentWizardOpen, setIsAgentWizardOpen] = useState(false);
  const [pendingAgentPosition, setPendingAgentPosition] = useState<{ x: number; y: number } | null>(null);

  // Menu state - closes on canvas interaction
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Node settings panel state
  const [settingsNodeId, setSettingsNodeId] = useState<number | null>(null);
  const settingsNode = settingsNodeId ? nodes.find(n => n.id === settingsNodeId) : null;

  // Grid and snap state
  const [gridEnabled, setGridEnabled] = useState(canvas?.grid_enabled ?? true);
  const [snapEnabled, setSnapEnabled] = useState(canvas?.snap_to_grid ?? true);

  // AI Assistant panel state
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);

  // For adding nodes from toolbar (center of viewport)
  const getViewportCenter = useCallback(() => {
    return {
      x: -viewport.x / viewport.zoom + 400,
      y: -viewport.y / viewport.zoom + 300,
    };
  }, [viewport]);

  const handleNodeAdd = useCallback(
    async (type: NodeType, position: { x: number; y: number }) => {
      const newNode = await addNode(type, position);

      // Auto-create a Key Result when Objective is created
      if (type === 'objective' && newNode) {
        const krPosition = {
          x: position.x + (newNode.width || 280) + 100,
          y: position.y,
        };
        const krNode = await addNode('keyresult', krPosition, 'Key Result 1');
        if (krNode) {
          await addConnection(newNode.id, krNode.id);
        }
        // Open settings for the new objective
        setSettingsNodeId(newNode.id);
      }
    },
    [addNode, addConnection]
  );

  // Add node from toolbar (at center of viewport)
  const handleToolbarAddNode = useCallback(
    async (type: NodeType) => {
      const center = getViewportCenter();
      const newNode = await addNode(type, center);

      // Auto-create a Key Result when Objective is created
      if (type === 'objective' && newNode) {
        const krPosition = {
          x: center.x + (newNode.width || 280) + 100,
          y: center.y,
        };
        const krNode = await addNode('keyresult', krPosition, 'Key Result 1');
        if (krNode) {
          await addConnection(newNode.id, krNode.id);
        }
        // Open settings for the new objective
        setSettingsNodeId(newNode.id);
      }
    },
    [addNode, addConnection, getViewportCenter]
  );

  const handleNodeUpdate = useCallback(
    async (nodeId: number, data: Partial<UpdateNodeRequest>) => {
      await updateNode(nodeId, data);
    },
    [updateNode]
  );

  const handleNodeResize = useCallback(
    (nodeId: number, width: number, height: number) => {
      resizeNode(nodeId, width, height);
    },
    [resizeNode]
  );

  const handleConnectionAdd = useCallback(
    async (sourceId: number, targetId: number, sourceAnchor?: string, targetAnchor?: string) => {
      // Enforce connection rules
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);

      if (sourceNode && targetNode) {
        const allowedTargets = CONNECTION_RULES[sourceNode.node_type] || [];
        // If there are specific rules and target isn't allowed, block it
        // Empty array means no restrictions (or node type not in rules)
        if (allowedTargets.length > 0 && !allowedTargets.includes(targetNode.node_type)) {
          toast.error(`Cannot connect ${sourceNode.node_type} to ${targetNode.node_type}`);
          return;
        }
      }

      await addConnection(sourceId, targetId, sourceAnchor, targetAnchor);
    },
    [addConnection, nodes]
  );

  const handleHome = useCallback(() => {
    router.push('/canvas');
  }, [router]);

  // Handle double-click on node to open settings (or doc editor for docs)
  const handleNodeDoubleClick = useCallback((nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsMenuOpen(false);

    if (node.node_type === 'doc') {
      // Doc nodes open full-screen editor
      setSettingsNodeId(null);
      setExpandedNodeId(nodeId);
    } else {
      // All other nodes open settings panel
      setSettingsNodeId(nodeId);
    }
  }, [nodes]);

  // Handle adding a connected node (e.g., Key Result from Objective)
  const handleAddConnectedNode = useCallback(
    async (sourceNodeId: number, nodeType: NodeType) => {
      const sourceNode = nodes.find(n => n.id === sourceNodeId);
      if (!sourceNode) return;

      // Position the new node to the right of the source
      const position = {
        x: sourceNode.position_x + sourceNode.width + 100,
        y: sourceNode.position_y,
      };

      const defaultName = nodeType === 'keyresult' ? 'New Key Result' :
                         nodeType === 'metric' ? 'New Metric' :
                         `New ${nodeType}`;

      const newNode = await addNode(nodeType, position, defaultName);
      if (newNode) {
        // Auto-connect the new node
        await addConnection(sourceNodeId, newNode.id);
        // Open settings for the new node
        setSettingsNodeId(newNode.id);
      }
    },
    [nodes, addNode, addConnection]
  );

  // Handle closing the doc editor
  const handleDocEditorClose = useCallback(() => {
    setExpandedNodeId(null);
  }, []);

  // Handle title change from doc editor
  const handleDocTitleChange = useCallback(async (title: string) => {
    if (expandedNodeId) {
      await updateNode(expandedNodeId, { name: title });
    }
  }, [expandedNodeId, updateNode]);

  // Handle content change from doc editor
  const handleDocContentChange = useCallback(async (content: string) => {
    if (expandedNodeId) {
      await updateNode(expandedNodeId, { content });
    }
  }, [expandedNodeId, updateNode]);

  // Handle opening agent wizard from context menu
  const handleAddAgent = useCallback((position: { x: number; y: number }) => {
    setPendingAgentPosition(position);
    setIsAgentWizardOpen(true);
  }, []);

  // Handle opening agent wizard from toolbar
  const handleToolbarAddAgent = useCallback(() => {
    const center = getViewportCenter();
    setPendingAgentPosition(center);
    setIsAgentWizardOpen(true);
  }, [getViewportCenter]);

  // Handle agent wizard completion
  const handleAgentWizardComplete = useCallback(
    async (name: string, description: string, config: AgentNodeConfig) => {
      if (pendingAgentPosition) {
        // Create the agent node
        const newNode = await addNode('agent', pendingAgentPosition, name);
        if (newNode) {
          // Update with description and config
          await updateNode(newNode.id, {
            content: description,
            config: config as unknown as Record<string, unknown>,
          });
        }
      }
      setIsAgentWizardOpen(false);
      setPendingAgentPosition(null);
    },
    [pendingAgentPosition, addNode, updateNode]
  );

  // Handle closing agent wizard
  const handleAgentWizardClose = useCallback(() => {
    setIsAgentWizardOpen(false);
    setPendingAgentPosition(null);
  }, []);

  const handleSave = useCallback(async () => {
    await saveCanvas();
  }, [saveCanvas]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewport({ ...viewport, zoom: Math.min(3, viewport.zoom * 1.2) });
  }, [viewport, setViewport]);

  const handleZoomOut = useCallback(() => {
    setViewport({ ...viewport, zoom: Math.max(0.1, viewport.zoom / 1.2) });
  }, [viewport, setViewport]);

  const handleResetZoom = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

  // Close menu and settings panel when canvas is interacted with
  const handleCanvasInteraction = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // Don't close settings on every interaction - only on panning/zooming
    // Settings closes via overlay click or explicit close
  }, [isMenuOpen]);

  // Toggle grid
  const handleGridToggle = useCallback(() => {
    setGridEnabled(prev => !prev);
  }, []);

  // Toggle snap to grid
  const handleSnapToggle = useCallback(() => {
    setSnapEnabled(prev => !prev);
  }, []);

  // Export canvas
  const handleExport = useCallback(() => {
    toast.info('Export functionality coming soon');
  }, []);

  // Duplicate canvas
  const handleDuplicate = useCallback(() => {
    toast.info('Duplicate functionality coming soon');
  }, []);

  // Delete canvas
  const handleDeleteCanvas = useCallback(() => {
    toast.info('Delete functionality coming soon');
  }, []);

  // Auto-layout handler
  const handleAutoLayout = useCallback(() => {
    autoLayout();
    toast.success('Nodes arranged! Use Undo Layout to revert.');
  }, [autoLayout]);

  // Undo layout handler
  const handleUndoLayout = useCallback(() => {
    undoLayout();
    toast.success('Layout reverted.');
  }, [undoLayout]);

  // Keyboard shortcuts for layout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + L for auto-layout
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        handleAutoLayout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAutoLayout]);

  // AI Assistant handlers
  const handleOpenAssistant = useCallback(() => {
    setIsAgentPanelOpen(true);
  }, []);

  const handleAgentCreateNode = useCallback(
    async (type: NodeType, name: string, content?: string) => {
      const center = getViewportCenter();
      // Offset each new node slightly to avoid stacking
      const offset = nodes.length * 20;
      const position = { x: center.x + offset, y: center.y + offset };
      const newNode = await addNode(type, position, name);
      if (newNode && content) {
        await updateNode(newNode.id, { content });
      }
      return newNode?.id ?? null;
    },
    [addNode, updateNode, getViewportCenter, nodes.length]
  );

  const handleAgentConnectNodes = useCallback(
    async (sourceId: number, targetId: number) => {
      try {
        await addConnection(sourceId, targetId);
        return true;
      } catch {
        return false;
      }
    },
    [addConnection]
  );

  const handleAgentUpdateNode = useCallback(
    async (nodeId: number, data: { name?: string; content?: string }) => {
      await updateNode(nodeId, data);
    },
    [updateNode]
  );

  const handleAgentDeleteNode = useCallback(
    async (nodeId: number) => {
      await deleteNode(nodeId);
    },
    [deleteNode]
  );

  const getCanvasState = useCallback(() => {
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.node_type,
        content: n.content,
      })),
      connections: connections.map(c => ({
        sourceId: c.source_node_id,
        targetId: c.target_node_id,
      })),
    };
  }, [nodes, connections]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading canvas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-destructive">{error}</div>
        <Button variant="outline" onClick={handleHome}>
          Back to Canvases
        </Button>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-muted-foreground">Canvas not found</div>
        <Button variant="outline" onClick={handleHome}>
          Back to Canvases
        </Button>
      </div>
    );
  }

  // Check if collaboration is enabled (Liveblocks API key exists)
  const isCollaborationEnabled = isLiveblocksEnabled;

  // Canvas content (with or without collaboration wrapper)
  const canvasContent = (
    <div ref={canvasContainerRef} className="fixed inset-0 bg-background">
      {/* Full-screen Canvas */}
      <Canvas
        nodes={nodes}
        connections={connections}
        viewport={viewport}
        selectedNodeIds={selectedNodeIds}
        gridEnabled={gridEnabled}
        gridSize={canvas.grid_size}
        snapToGrid={snapEnabled}
        onViewportChange={setViewport}
        onNodeSelect={selectNode}
        onNodeMove={moveNode}
        onNodeResize={handleNodeResize}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={deleteNode}
        onNodeAdd={handleNodeAdd}
        onAddAgent={handleAddAgent}
        onConnectionAdd={handleConnectionAdd}
        onConnectionDelete={deleteConnection}
        onClearSelection={clearSelection}
        onNodeDoubleClick={handleNodeDoubleClick}
        onAddConnectedNode={handleAddConnectedNode}
        onCanvasInteraction={handleCanvasInteraction}
        className="w-full h-full"
      />

      {/* Collaboration: Other users' cursors */}
      {isCollaborationEnabled && <Cursors />}

      {/* Floating Toolbar - hidden when doc editor is open */}
      {!expandedNodeId && (
        <CanvasFloatingToolbar
          canvasName={canvas.name}
          zoom={viewport.zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onSave={handleSave}
          onAddNode={handleToolbarAddNode}
          onAddAgent={handleToolbarAddAgent}
          onHome={handleHome}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          gridEnabled={gridEnabled}
          onGridToggle={handleGridToggle}
          snapEnabled={snapEnabled}
          onSnapToggle={handleSnapToggle}
          onExport={handleExport}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteCanvas}
          onOpenAssistant={handleOpenAssistant}
          onAutoLayout={handleAutoLayout}
          onUndoLayout={handleUndoLayout}
          canUndoLayout={canUndoLayout}
        />
      )}

      {/* Collaboration: Show who's online */}
      {isCollaborationEnabled && !expandedNodeId && (
        <div className="fixed top-4 right-48 z-50">
          <Collaborators maxDisplay={4} />
        </div>
      )}

      {/* Full-screen Doc Editor */}
      {expandedNode && expandedNode.node_type === 'doc' && (
        <DocEditor
          title={expandedNode.name}
          content={expandedNode.content || ''}
          onTitleChange={handleDocTitleChange}
          onContentChange={handleDocContentChange}
          onClose={handleDocEditorClose}
        />
      )}

      {/* Node Settings Panel */}
      <NodeSettingsPanel
        node={settingsNode || null}
        isOpen={settingsNodeId !== null}
        onClose={() => setSettingsNodeId(null)}
        onUpdate={handleNodeUpdate}
        onDelete={deleteNode}
        onAddConnectedNode={handleAddConnectedNode}
      />

      {/* Agent Wizard */}
      <AgentWizard
        isOpen={isAgentWizardOpen}
        onClose={handleAgentWizardClose}
        onComplete={handleAgentWizardComplete}
      />

      {/* AI Canvas Assistant - Sessions are private per user */}
      <CanvasAgentPanel
        isOpen={isAgentPanelOpen}
        onClose={() => setIsAgentPanelOpen(false)}
        canvasId={canvasId}
        userId={userId}
        onCreateNode={handleAgentCreateNode}
        onConnectNodes={handleAgentConnectNodes}
        onUpdateNode={handleAgentUpdateNode}
        onDeleteNode={handleAgentDeleteNode}
        getCanvasState={getCanvasState}
      />
    </div>
  );

  // Wrap with collaboration room if enabled
  if (isCollaborationEnabled) {
    return (
      <CollaborationRoom roomId={`canvas-${canvasId}`}>
        {canvasContent}
      </CollaborationRoom>
    );
  }

  return canvasContent;
}
