import dagre from 'dagre';
import { CanvasNode, NodeConnection } from '@/types/canvas';

interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing?: number;
  rankSpacing?: number;
  marginX?: number;
  marginY?: number;
}

interface LayoutResult {
  nodes: Array<{ id: number; x: number; y: number }>;
  width: number;
  height: number;
}

/**
 * Auto-layout nodes using Dagre directed graph layout
 * Perfect for hierarchical structures like OKRs
 */
export function autoLayoutNodes(
  nodes: CanvasNode[],
  connections: NodeConnection[],
  options: LayoutOptions = {}
): LayoutResult {
  const {
    direction = 'TB',
    nodeSpacing = 50,
    rankSpacing = 100,
    marginX = 50,
    marginY = 50,
  } = options;

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: marginX,
    marginy: marginY,
  });

  // Default to assigning a new object as a label for each new edge
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(String(node.id), {
      width: node.width || 280,
      height: node.height || 150,
    });
  });

  // Add edges (connections) to the graph
  connections.forEach((conn) => {
    g.setEdge(String(conn.source_node_id), String(conn.target_node_id));
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Extract positioned nodes
  const positionedNodes = nodes.map((node) => {
    const layoutNode = g.node(String(node.id));
    return {
      id: node.id,
      // Dagre returns center position, convert to top-left
      x: layoutNode.x - (node.width || 280) / 2,
      y: layoutNode.y - (node.height || 150) / 2,
    };
  });

  // Get graph dimensions
  const graphLabel = g.graph();

  return {
    nodes: positionedNodes,
    width: graphLabel.width || 800,
    height: graphLabel.height || 600,
  };
}

/**
 * Layout nodes by type hierarchy (OKR-specific)
 * Orders: problem → objective → keyresult → metric → problem → doc
 */
export function autoLayoutByHierarchy(
  nodes: CanvasNode[],
  connections: NodeConnection[],
  options: LayoutOptions = {}
): LayoutResult {
  const typeOrder: Record<string, number> = {
    problem: 0,      // Root problems at top
    objective: 1,
    keyresult: 2,
    metric: 3,
    // Sub-problems below metrics
    doc: 5,
    agent: 6,
    integration: 7,
    webhook: 8,
    api: 9,
    mcp: 10,
    custom: 11,
  };

  // Assign ranks based on node type for better hierarchy
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: options.direction || 'TB',
    nodesep: options.nodeSpacing || 80,
    ranksep: options.rankSpacing || 120,
    marginx: options.marginX || 50,
    marginy: options.marginY || 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes with rank hints
  nodes.forEach((node) => {
    g.setNode(String(node.id), {
      width: node.width || 280,
      height: node.height || 150,
      // Rank based on node type for consistent hierarchy
      rank: typeOrder[node.node_type] ?? 99,
    });
  });

  // Add edges
  connections.forEach((conn) => {
    g.setEdge(String(conn.source_node_id), String(conn.target_node_id));
  });

  dagre.layout(g);

  const positionedNodes = nodes.map((node) => {
    const layoutNode = g.node(String(node.id));
    return {
      id: node.id,
      x: layoutNode.x - (node.width || 280) / 2,
      y: layoutNode.y - (node.height || 150) / 2,
    };
  });

  const graphLabel = g.graph();

  return {
    nodes: positionedNodes,
    width: graphLabel.width || 800,
    height: graphLabel.height || 600,
  };
}

/**
 * Center the viewport on all nodes
 */
export function calculateCenterViewport(
  nodes: CanvasNode[],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  // Find bounding box
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position_x);
    minY = Math.min(minY, node.position_y);
    maxX = Math.max(maxX, node.position_x + (node.width || 280));
    maxY = Math.max(maxY, node.position_y + (node.height || 150));
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const padding = 100;

  // Calculate zoom to fit
  const zoomX = (containerWidth - padding * 2) / contentWidth;
  const zoomY = (containerHeight - padding * 2) / contentHeight;
  const zoom = Math.min(1, Math.min(zoomX, zoomY)); // Don't zoom in past 100%

  // Calculate offset to center
  const centerX = minX + contentWidth / 2;
  const centerY = minY + contentHeight / 2;

  const x = containerWidth / 2 - centerX * zoom;
  const y = containerHeight / 2 - centerY * zoom;

  return { x, y, zoom };
}

/**
 * Simple grid layout for nodes without connections
 */
export function gridLayout(
  nodes: CanvasNode[],
  options: { columns?: number; spacing?: number; startX?: number; startY?: number } = {}
): Array<{ id: number; x: number; y: number }> {
  const { columns = 4, spacing = 50, startX = 50, startY = 50 } = options;

  return nodes.map((node, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const nodeWidth = node.width || 280;
    const nodeHeight = node.height || 150;

    return {
      id: node.id,
      x: startX + col * (nodeWidth + spacing),
      y: startY + row * (nodeHeight + spacing),
    };
  });
}
