// Canvas Types for Miro-style product management canvas

export type NodeType =
  | 'doc'
  | 'agent'
  | 'skill'
  | 'webhook'
  | 'api'
  | 'mcp'
  | 'problem'
  | 'objective'
  | 'keyresult'
  | 'metric'
  | 'custom';

// Connection rules - defines what each node type can connect TO
// Empty array = no restrictions (can connect to anything)
export const CONNECTION_RULES: Record<NodeType, NodeType[]> = {
  problem: ['doc', 'agent', 'skill', 'webhook', 'api', 'mcp', 'problem', 'keyresult', 'custom'], // Everything except objective and metric
  objective: ['keyresult'],           // Objective can only connect to Key Results
  keyresult: ['metric'],              // Key Result can only connect to Metrics
  metric: [],                         // Metrics can connect to anything
  doc: [],                            // Docs can connect to anything
  agent: [],                          // Agents can connect to anything
  skill: [],                          // Skills can connect to anything
  webhook: [],                        // Webhooks can connect to anything
  api: [],                            // APIs can connect to anything
  mcp: [],                            // MCP can connect to anything
  custom: [],                         // Custom can connect to anything
};

// What can be added when clicking on a node (contextual add menu)
export const CONTEXTUAL_ADD_OPTIONS: Record<NodeType, NodeType[]> = {
  problem: ['objective'],             // Clicking Problem can add Objective
  objective: ['keyresult'],           // Clicking Objective can add Key Result
  keyresult: ['metric'],              // Clicking Key Result can add Metric
  metric: [],                         // Metrics don't have add options
  doc: ['doc'],
  agent: [],
  skill: [],
  webhook: [],
  api: [],
  mcp: [],
  custom: [],
};

// Skill types for agent connections
export type SkillType = 'slack' | 'jira' | 'confluence' | 'github' | 'notion' | 'linear';

export interface AgentSkill {
  type: SkillType;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config?: Record<string, unknown>;
}

export interface AgentDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  content?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Workflow stage values for swimlane visualization
export type WorkflowStage =
  | 'research'
  | 'prd_review'
  | 'ux_review'
  | 'tech_spec'
  | 'project_kickoff'
  | 'development'
  | 'qa'
  | 'launch'
  | 'retrospective';

export interface CanvasNode {
  id: number;
  name: string;
  node_type: NodeType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  content: string;
  config: Record<string, unknown>;
  node_metadata: Record<string, unknown>;
  color: string;
  border_color: string;
  is_locked: boolean;
  is_collapsed: boolean;
  z_index: number;
  workflow_stage?: WorkflowStage | null;
  canvas_id: number;
  created_at: string;
  updated_at: string;
}

// Anchor positions for connection points
export type AnchorPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface NodeConnection {
  id: number;
  source_node_id: number;
  target_node_id: number;
  source_anchor?: AnchorPosition;
  target_anchor?: AnchorPosition;
  connection_type: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  label?: string;
  config: Record<string, unknown>;
  created_at: string;
}

export interface Canvas {
  id: number;
  name: string;
  description?: string;
  viewport_x: number;
  viewport_y: number;
  zoom_level: number;
  grid_enabled: boolean;
  snap_to_grid: boolean;
  grid_size: number;
  settings: Record<string, unknown>;
  owner_id?: number;
  organization_id?: number;
  created_at: string;
  updated_at: string;
  nodes?: CanvasNode[];
  connections?: NodeConnection[];
}

// Request/Response types
export interface CreateCanvasRequest {
  name: string;
  description?: string;
  organization_id?: number;
}

export interface UpdateCanvasRequest {
  name?: string;
  description?: string;
  viewport_x?: number;
  viewport_y?: number;
  zoom_level?: number;
  grid_enabled?: boolean;
  snap_to_grid?: boolean;
  grid_size?: number;
  settings?: Record<string, unknown>;
}

export interface CreateNodeRequest {
  name: string;
  node_type: NodeType;
  canvas_id: number;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  content?: string;
  config?: Record<string, unknown>;
  node_metadata?: Record<string, unknown>;
  color?: string;
  border_color?: string;
}

export interface UpdateNodeRequest {
  name?: string;
  node_type?: NodeType;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  content?: string;
  config?: Record<string, unknown>;
  node_metadata?: Record<string, unknown>;
  color?: string;
  border_color?: string;
  is_locked?: boolean;
  is_collapsed?: boolean;
  z_index?: number;
  workflow_stage?: WorkflowStage | null;
}

export interface CreateConnectionRequest {
  source_node_id: number;
  target_node_id: number;
  source_anchor?: string;
  target_anchor?: string;
  connection_type?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

export interface BatchPositionUpdate {
  nodes: Array<{
    id: number;
    position_x: number;
    position_y: number;
  }>;
}

// OKR Types
export interface Objective {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  level: 'company' | 'team' | 'individual';
  parent_id?: number;
  owner_id?: number;
  node_id?: number;
  key_results?: KeyResult[];
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: number;
  title: string;
  description?: string;
  metric_type: 'percentage' | 'number' | 'currency' | 'boolean';
  target_value: number;
  current_value: number;
  start_value: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  objective_id: number;
  linked_metric_id?: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: number;
  name: string;
  description?: string;
  value: number;
  unit?: string;
  source_type: 'manual' | 'api' | 'skill';
  source_config: Record<string, unknown>;
  refresh_interval: number;
  display_format: string;
  color: string;
  history: Array<{ timestamp: string; value: number }>;
  node_id?: number;
  owner_id?: number;
  last_refreshed?: string;
  created_at: string;
  updated_at: string;
}

// Canvas state for local management
export interface CanvasState {
  canvas: Canvas | null;
  nodes: CanvasNode[];
  connections: NodeConnection[];
  selectedNodeIds: number[];
  viewport: Viewport;
  isDragging: boolean;
  isPanning: boolean;
  isConnecting: boolean;
  connectingFromNodeId: number | null;
}

// Node config types for specific node types
export interface DocNodeConfig {
  autoSave?: boolean;
  saveInterval?: number;
}

export interface SkillNodeConfig {
  service: string;
  connected?: boolean;
  credentials?: Record<string, unknown>;
  endpoints?: string[];
  // Per-canvas tracking config
  jira?: {
    projectKey?: string;
    jql?: string;
    selectedIssues?: string[];
  };
  confluence?: {
    spaceKeys?: string[];
  };
  lastSyncAt?: string;
  syncStatus?: 'idle' | 'syncing' | 'error';
  syncError?: string;
  issueCount?: number;
  spaceCount?: number;
  isIndexedForAI?: boolean;
}

export interface WebhookNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  responseMapping?: Record<string, string>;
}

export interface McpNodeConfig {
  serverUrl: string;
  protocol: 'stdio' | 'http';
  tools?: string[];
  resources?: string[];
}

export interface AgentNodeConfig {
  instructions: string;
  contextType: 'documents' | 'skills' | 'both';
  documents?: AgentDocument[];
  skills?: AgentSkill[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ObjectiveNodeConfig {
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  timeframe?: {
    startDate?: string;
    endDate?: string;
    quarter?: string;
  };
  owner?: string;
  level: 'company' | 'team' | 'individual';
}

export interface KeyResultNodeConfig {
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
  metricType: 'percentage' | 'number' | 'currency' | 'boolean';
  status: 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed';
  linkedMetricId?: number;
  linkedMetricName?: string;
}

export interface MetricNodeConfig {
  value: number;
  previousValue?: number;
  unit: string;
  format: 'number' | 'percentage' | 'currency';
  trend: 'up' | 'down' | 'stable';
  source: 'manual' | 'api' | 'skill';
  refreshInterval?: number;
}

// Sync configuration for canvas integrations
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

export interface CanvasSyncConfig {
  frequency: SyncFrequency;
  skills: string[];  // 'jira', 'confluence', 'slack'
  lastSync?: string;
  nextScheduledSync?: string;
  enabled: boolean;
}

// Problem/signal configuration for canvas monitoring
export interface CanvasProblemConfig {
  problems: string[];           // Problem statements to watch for
  signals: ProblemSignal[];     // Specific signals to monitor
  notifyOnMatch: boolean;
  autoCreateTasks: boolean;
}

export interface ProblemSignal {
  id: string;
  type: 'jira_query' | 'slack_keyword' | 'confluence_change' | 'custom';
  name: string;
  description: string;
  config: {
    jql?: string;              // For Jira queries
    keywords?: string[];       // For Slack monitoring
    pageIds?: string[];        // For Confluence changes
    customQuery?: string;      // For custom signals
  };
  enabled: boolean;
  lastTriggered?: string;
}

// Canvas goals configuration
export interface CanvasGoals {
  objective: string;           // Main objective statement
  successMetrics: string[];    // What success looks like
  keyResults: string[];        // Key results to track
  timeframe?: {
    startDate?: string;
    endDate?: string;
    quarter?: string;
  };
}

// Extended canvas settings to include sync and problem config
export interface CanvasSettings {
  sync?: CanvasSyncConfig;
  problems?: CanvasProblemConfig;
  goals?: CanvasGoals;
}
