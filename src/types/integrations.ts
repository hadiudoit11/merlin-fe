// Integration Types

export type IntegrationProvider =
  | 'confluence'
  | 'notion'
  | 'google-docs'
  | 'slack'
  | 'jira'
  | 'github'
  | 'linear';

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: IntegrationConfig;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  error?: string;
}

export interface IntegrationConfig {
  // OAuth tokens
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;

  // Provider-specific
  siteUrl?: string;      // e.g., https://yourcompany.atlassian.net
  cloudId?: string;      // Confluence cloud ID
  workspaceId?: string;  // Notion workspace ID

  // Sync settings
  syncEnabled?: boolean;
  syncDirection?: 'import' | 'export' | 'bidirectional';
  syncInterval?: number; // minutes
  autoSync?: boolean;
}

// Confluence-specific types
export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: 'global' | 'personal';
  icon?: string;
}

export interface ConfluencePage {
  id: string;
  title: string;
  spaceKey: string;
  parentId?: string;
  body: {
    storage: {
      value: string;
      representation: 'storage';
    };
  };
  version: {
    number: number;
  };
  _links: {
    webui: string;
  };
  children?: ConfluencePage[];
}

export interface SpaceIntegration {
  id: string;
  spaceId: string;          // Merlin space ID
  integrationId: string;     // Integration connection ID
  provider: IntegrationProvider;

  // Confluence mapping
  confluenceSpaceKey?: string;
  confluenceSpaceId?: string;
  confluenceSpaceName?: string;

  // Sync config
  syncEnabled: boolean;
  syncDirection: 'import' | 'export' | 'bidirectional';
  lastSyncAt?: string;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError?: string;

  // Mapping of page IDs: Merlin page ID -> Confluence page ID
  pageMappings: Record<string, string>;

  createdAt: string;
  updatedAt: string;
}

export interface PageSyncStatus {
  pageId: string;
  externalId?: string;
  externalUrl?: string;
  provider: IntegrationProvider;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncAt?: string;
  localVersion: number;
  remoteVersion?: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  imported: number;
  exported: number;
  conflicts: number;
  errors: string[];
}

// Jira-specific types
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrl?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    category: 'new' | 'indeterminate' | 'done';
  };
  priority?: {
    name: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    avatarUrl?: string;
  };
  issueType: {
    name: string;
    iconUrl?: string;
  };
  created: string;
  updated: string;
  webUrl: string;
}

export interface JiraConnectionInfo {
  connected: boolean;
  siteName?: string;
  cloudId?: string;
  connectedAt?: string;
  connectedById?: number;
}

export interface JiraConnectionStatus {
  connected: boolean;
  activeScope?: 'organization' | 'personal';
  organization?: JiraConnectionInfo;
  personal?: JiraConnectionInfo;
  // Legacy fields for backwards compatibility
  siteName?: string;
  cloudId?: string;
  connectedAt?: string;
}

export interface JiraImportRequest {
  jql: string;
  canvasId?: number;
}

export interface JiraImportResult {
  status: string;
  message: string;
  imported: number;
  updated: number;
}

export interface JiraPushRequest {
  taskId: number;
  projectKey: string;
  issueType?: string;
}

export interface JiraPushResult {
  status: string;
  message: string;
  issueKey?: string;
  issueUrl?: string;
}

// Provider metadata
export const INTEGRATION_PROVIDERS: Record<IntegrationProvider, {
  name: string;
  icon: string;
  description: string;
  features: string[];
  authType: 'oauth' | 'api_key' | 'token';
  category: 'documents' | 'tasks' | 'communication' | 'development';
}> = {
  confluence: {
    name: 'Confluence',
    icon: '📘',
    description: 'Sync with Atlassian Confluence',
    features: ['Import pages', 'Export pages', 'Two-way sync', 'Preserve hierarchy'],
    authType: 'oauth',
    category: 'documents',
  },
  notion: {
    name: 'Notion',
    icon: '📝',
    description: 'Connect to Notion workspaces',
    features: ['Import pages', 'Export pages', 'Database sync'],
    authType: 'oauth',
    category: 'documents',
  },
  'google-docs': {
    name: 'Google Docs',
    icon: '📄',
    description: 'Sync with Google Workspace',
    features: ['Import docs', 'Export docs', 'Folder sync'],
    authType: 'oauth',
    category: 'documents',
  },
  slack: {
    name: 'Slack',
    icon: '💬',
    description: 'Share and notify via Slack',
    features: ['Share pages', 'Notifications', 'Search'],
    authType: 'oauth',
    category: 'communication',
  },
  jira: {
    name: 'Jira',
    icon: '🎫',
    description: 'Sync tasks with Jira issues',
    features: ['Import issues', 'Push tasks', 'Status sync', 'Webhook updates'],
    authType: 'oauth',
    category: 'tasks',
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    description: 'Connect to GitHub repos',
    features: ['Sync markdown', 'Link PRs', 'Embed code'],
    authType: 'oauth',
    category: 'development',
  },
  linear: {
    name: 'Linear',
    icon: '📐',
    description: 'Connect to Linear',
    features: ['Link issues', 'Embed tickets', 'Roadmap sync'],
    authType: 'oauth',
    category: 'tasks',
  },
};
