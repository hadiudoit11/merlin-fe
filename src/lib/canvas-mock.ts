/**
 * Mock Canvas API - Uses localStorage for persistence during UI development.
 * Switch to real API by setting NEXT_PUBLIC_USE_MOCK_API=false
 */

import {
  Canvas,
  CanvasNode,
  NodeConnection,
  CreateCanvasRequest,
  UpdateCanvasRequest,
  CreateNodeRequest,
  UpdateNodeRequest,
  CreateConnectionRequest,
  BatchPositionUpdate,
  Objective,
  KeyResult,
  Metric,
} from '@/types/canvas';

const STORAGE_KEYS = {
  canvases: 'merlin_canvases',
  nodes: 'merlin_nodes',
  connections: 'merlin_connections',
  objectives: 'merlin_objectives',
  keyResults: 'merlin_key_results',
  metrics: 'merlin_metrics',
  idCounters: 'merlin_id_counters',
};

// Helper to generate IDs
function getNextId(type: string): number {
  if (typeof window === 'undefined') return 1;

  const counters = JSON.parse(localStorage.getItem(STORAGE_KEYS.idCounters) || '{}');
  const nextId = (counters[type] || 0) + 1;
  counters[type] = nextId;
  localStorage.setItem(STORAGE_KEYS.idCounters, JSON.stringify(counters));
  return nextId;
}

// Helper to get/set localStorage
function getStorage<T>(key: string, defaultValue: T[] = []): T[] {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Simulate network delay for realistic UX
const delay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

class MockCanvasApi {
  // ============ Canvas Operations ============

  async listCanvases(): Promise<Canvas[]> {
    await delay();
    return getStorage<Canvas>(STORAGE_KEYS.canvases);
  }

  async getCanvas(canvasId: number): Promise<Canvas> {
    await delay();
    const canvases = getStorage<Canvas>(STORAGE_KEYS.canvases);
    const canvas = canvases.find((c) => c.id === canvasId);
    if (!canvas) throw new Error('Canvas not found');

    // Include nodes
    const allNodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    const canvasNodes = allNodes.filter((n) => n.canvas_id === canvasId);

    return { ...canvas, nodes: canvasNodes };
  }

  async createCanvas(data: CreateCanvasRequest): Promise<Canvas> {
    await delay();
    const now = new Date().toISOString();
    const canvas: Canvas = {
      id: getNextId('canvas'),
      name: data.name,
      description: data.description,
      viewport_x: 0,
      viewport_y: 0,
      zoom_level: 1,
      grid_enabled: true,
      snap_to_grid: true,
      grid_size: 20,
      settings: {},
      owner_id: 1,
      created_at: now,
      updated_at: now,
    };

    const canvases = getStorage<Canvas>(STORAGE_KEYS.canvases);
    canvases.push(canvas);
    setStorage(STORAGE_KEYS.canvases, canvases);

    return canvas;
  }

  async updateCanvas(canvasId: number, data: UpdateCanvasRequest): Promise<Canvas> {
    await delay();
    const canvases = getStorage<Canvas>(STORAGE_KEYS.canvases);
    const index = canvases.findIndex((c) => c.id === canvasId);
    if (index === -1) throw new Error('Canvas not found');

    canvases[index] = {
      ...canvases[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.canvases, canvases);

    return canvases[index];
  }

  async deleteCanvas(canvasId: number): Promise<void> {
    await delay();
    const canvases = getStorage<Canvas>(STORAGE_KEYS.canvases);
    setStorage(
      STORAGE_KEYS.canvases,
      canvases.filter((c) => c.id !== canvasId)
    );

    // Also delete associated nodes and connections
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    const nodeIds = nodes.filter((n) => n.canvas_id === canvasId).map((n) => n.id);
    setStorage(
      STORAGE_KEYS.nodes,
      nodes.filter((n) => n.canvas_id !== canvasId)
    );

    const connections = getStorage<NodeConnection>(STORAGE_KEYS.connections);
    setStorage(
      STORAGE_KEYS.connections,
      connections.filter(
        (c) => !nodeIds.includes(c.source_node_id) && !nodeIds.includes(c.target_node_id)
      )
    );
  }

  // ============ Node Operations ============

  async listNodes(canvasId: number): Promise<CanvasNode[]> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    return nodes.filter((n) => n.canvas_id === canvasId);
  }

  async getNode(nodeId: number): Promise<CanvasNode> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error('Node not found');
    return node;
  }

  async createNode(data: CreateNodeRequest): Promise<CanvasNode> {
    await delay();
    const now = new Date().toISOString();
    const node: CanvasNode = {
      id: getNextId('node'),
      name: data.name,
      node_type: data.node_type,
      canvas_id: data.canvas_id,
      position_x: data.position_x ?? 100,
      position_y: data.position_y ?? 100,
      width: data.width ?? 300,
      height: data.height ?? 200,
      content: data.content ?? '',
      config: data.config ?? {},
      node_metadata: data.node_metadata ?? {},
      color: data.color ?? '#ffffff',
      border_color: data.border_color ?? '#e5e7eb',
      is_locked: false,
      is_collapsed: false,
      z_index: 0,
      created_at: now,
      updated_at: now,
    };

    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    nodes.push(node);
    setStorage(STORAGE_KEYS.nodes, nodes);

    return node;
  }

  async updateNode(nodeId: number, data: UpdateNodeRequest): Promise<CanvasNode> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) throw new Error('Node not found');

    nodes[index] = {
      ...nodes[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.nodes, nodes);

    return nodes[index];
  }

  async updateNodePosition(
    nodeId: number,
    position_x: number,
    position_y: number
  ): Promise<CanvasNode> {
    return this.updateNode(nodeId, { position_x, position_y });
  }

  async batchUpdatePositions(data: BatchPositionUpdate): Promise<{ status: string; count: number }> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);

    data.nodes.forEach((update) => {
      const index = nodes.findIndex((n) => n.id === update.id);
      if (index !== -1) {
        nodes[index].position_x = update.position_x;
        nodes[index].position_y = update.position_y;
        nodes[index].updated_at = new Date().toISOString();
      }
    });

    setStorage(STORAGE_KEYS.nodes, nodes);
    return { status: 'updated', count: data.nodes.length };
  }

  async deleteNode(nodeId: number): Promise<void> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    setStorage(
      STORAGE_KEYS.nodes,
      nodes.filter((n) => n.id !== nodeId)
    );

    // Also delete connections involving this node
    const connections = getStorage<NodeConnection>(STORAGE_KEYS.connections);
    setStorage(
      STORAGE_KEYS.connections,
      connections.filter((c) => c.source_node_id !== nodeId && c.target_node_id !== nodeId)
    );
  }

  // ============ Connection Operations ============

  async createConnection(data: CreateConnectionRequest): Promise<NodeConnection> {
    await delay();
    const connection: NodeConnection = {
      id: getNextId('connection'),
      source_node_id: data.source_node_id,
      target_node_id: data.target_node_id,
      connection_type: data.connection_type ?? 'default',
      color: data.color ?? '#6b7280',
      style: data.style ?? 'solid',
      label: data.label,
      config: {},
      created_at: new Date().toISOString(),
    };

    const connections = getStorage<NodeConnection>(STORAGE_KEYS.connections);
    connections.push(connection);
    setStorage(STORAGE_KEYS.connections, connections);

    return connection;
  }

  async deleteConnection(connectionId: number): Promise<void> {
    await delay();
    const connections = getStorage<NodeConnection>(STORAGE_KEYS.connections);
    setStorage(
      STORAGE_KEYS.connections,
      connections.filter((c) => c.id !== connectionId)
    );
  }

  async getConnections(canvasId: number): Promise<NodeConnection[]> {
    await delay();
    const nodes = getStorage<CanvasNode>(STORAGE_KEYS.nodes);
    const nodeIds = nodes.filter((n) => n.canvas_id === canvasId).map((n) => n.id);
    const connections = getStorage<NodeConnection>(STORAGE_KEYS.connections);
    return connections.filter(
      (c) => nodeIds.includes(c.source_node_id) || nodeIds.includes(c.target_node_id)
    );
  }

  // ============ OKR Operations ============

  async listObjectives(params?: { level?: string; status?: string }): Promise<Objective[]> {
    await delay();
    let objectives = getStorage<Objective>(STORAGE_KEYS.objectives);
    if (params?.level) {
      objectives = objectives.filter((o) => o.level === params.level);
    }
    if (params?.status) {
      objectives = objectives.filter((o) => o.status === params.status);
    }
    return objectives;
  }

  async createObjective(data: Partial<Objective>): Promise<Objective> {
    await delay();
    const now = new Date().toISOString();
    const objective: Objective = {
      id: getNextId('objective'),
      title: data.title || 'New Objective',
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'active',
      level: data.level || 'company',
      parent_id: data.parent_id,
      owner_id: 1,
      node_id: data.node_id,
      key_results: [],
      created_at: now,
      updated_at: now,
    };

    const objectives = getStorage<Objective>(STORAGE_KEYS.objectives);
    objectives.push(objective);
    setStorage(STORAGE_KEYS.objectives, objectives);

    return objective;
  }

  // ============ Metrics Operations ============

  async listMetrics(): Promise<Metric[]> {
    await delay();
    return getStorage<Metric>(STORAGE_KEYS.metrics);
  }

  async createMetric(data: Partial<Metric>): Promise<Metric> {
    await delay();
    const now = new Date().toISOString();
    const metric: Metric = {
      id: getNextId('metric'),
      name: data.name || 'New Metric',
      description: data.description,
      value: data.value ?? 0,
      unit: data.unit,
      source_type: data.source_type || 'manual',
      source_config: data.source_config || {},
      refresh_interval: data.refresh_interval || 3600,
      display_format: data.display_format || 'number',
      color: data.color || '#3b82f6',
      history: [],
      node_id: data.node_id,
      owner_id: 1,
      created_at: now,
      updated_at: now,
    };

    const metrics = getStorage<Metric>(STORAGE_KEYS.metrics);
    metrics.push(metric);
    setStorage(STORAGE_KEYS.metrics, metrics);

    return metric;
  }

  async updateMetricValue(metricId: number, value: number): Promise<Metric> {
    await delay();
    const metrics = getStorage<Metric>(STORAGE_KEYS.metrics);
    const index = metrics.findIndex((m) => m.id === metricId);
    if (index === -1) throw new Error('Metric not found');

    // Add to history
    metrics[index].history.push({
      timestamp: new Date().toISOString(),
      value: metrics[index].value,
    });
    metrics[index].value = value;
    metrics[index].last_refreshed = new Date().toISOString();
    metrics[index].updated_at = new Date().toISOString();

    setStorage(STORAGE_KEYS.metrics, metrics);
    return metrics[index];
  }

  // ============ Utility ============

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // Seed with demo data
  async seedDemoData(): Promise<void> {
    // Create a demo canvas
    const canvas = await this.createCanvas({
      name: 'Q1 2026 Planning',
      description: 'Company OKRs and initiatives for Q1',
    });

    // Add some demo nodes
    await this.createNode({
      name: 'Company Vision',
      node_type: 'doc',
      canvas_id: canvas.id,
      position_x: 100,
      position_y: 100,
      width: 400,
      height: 300,
      content: '<h2>Our Vision</h2><p>Build the best product management platform that teams love to use.</p><ul><li>User-centric design</li><li>Powerful integrations</li><li>Real-time collaboration</li></ul>',
    });

    await this.createNode({
      name: 'Revenue Target',
      node_type: 'metric',
      canvas_id: canvas.id,
      position_x: 550,
      position_y: 100,
      width: 250,
      height: 150,
      config: { value: 1250000, unit: 'ARR', target: 2000000 },
    });

    await this.createNode({
      name: 'Q1 Objectives',
      node_type: 'okr',
      canvas_id: canvas.id,
      position_x: 100,
      position_y: 450,
      width: 350,
      height: 200,
    });

    await this.createNode({
      name: 'Slack Integration',
      node_type: 'integration',
      canvas_id: canvas.id,
      position_x: 550,
      position_y: 300,
      width: 250,
      height: 150,
      config: { service: 'Slack', connected: true },
    });
  }
}

export const mockCanvasApi = new MockCanvasApi();
