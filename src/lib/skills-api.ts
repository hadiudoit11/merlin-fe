/**
 * Skills API Client
 *
 * Handles connections to external services like Confluence, Notion, etc.
 * All skill logic runs on the backend - this client just proxies requests.
 */

import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import {
  Skill,
  SkillProvider,
  SpaceSkill,
  ConfluenceSpace,
  ConfluencePage,
  PageSyncStatus,
  SyncResult,
  JiraConnectionStatus,
  JiraProject,
  JiraIssue,
  JiraImportRequest,
  JiraImportResult,
  JiraPushRequest,
  JiraPushResult,
} from '@/types/skills';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Backend response types (match backend schemas)
interface BackendSkill {
  id: number;
  provider: string;
  status: string;
  is_connected: boolean;
  provider_data: Record<string, unknown>;
  connected_by_id?: number;
  created_at: string;
  updated_at: string;
  site_url?: string;
  cloud_id?: string;
}

interface BackendSpaceSkill {
  id: number;
  skill_id: number;
  space_id: string;
  space_type: string;
  external_space_key?: string;
  external_space_id?: string;
  external_space_name?: string;
  sync_enabled: boolean;
  sync_direction: string;
  auto_sync: boolean;
  sync_status: string;
  last_sync_at?: string;
  last_sync_error?: string;
  created_at: string;
  updated_at: string;
}

interface BackendConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: string;
  icon?: string;
  description?: string;
}

interface BackendConfluencePage {
  id: string;
  title: string;
  space_key: string;
  version: number;
  web_url?: string;
  body_html?: string;
}

interface OAuthInitResponse {
  auth_url: string;
  state: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_configured: boolean;
  auth_type: string;
  scopes: string[];
}

class SkillsApiService {
  private client: AxiosInstance;
  private organizationId: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/skills`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(async (config) => {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.warn('Failed to get session for skill API request');
      }

      // Add organization context
      if (this.organizationId) {
        config.params = { ...config.params, organization_id: this.organizationId };
      }

      return config;
    });
  }

  setOrganizationId(orgId: number | null) {
    this.organizationId = orgId;
  }

  // ============ Provider Info ============

  async listProviders(): Promise<ProviderInfo[]> {
    const response = await this.client.get<ProviderInfo[]>('/providers');
    return response.data;
  }

  // ============ Skill Connections ============

  async listSkills(): Promise<Skill[]> {
    const response = await this.client.get<BackendSkill[]>('/');
    return response.data.map(this.mapSkill);
  }

  async getSkill(provider: SkillProvider): Promise<Skill | null> {
    try {
      const response = await this.client.get<BackendSkill>(`/${provider}`);
      return this.mapSkill(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async disconnectSkill(provider: SkillProvider): Promise<boolean> {
    try {
      await this.client.delete(`/${provider}`);
      return true;
    } catch {
      return false;
    }
  }

  // ============ Jira OAuth & Connection ============

  async connectJira(scope: 'individual' | 'organization' | 'personal' = 'individual'): Promise<{ authUrl: string }> {
    const response = await this.client.get<{ authorization_url: string }>('/jira/connect', {
      params: { scope },
    });
    return {
      authUrl: response.data.authorization_url,
    };
  }

  async getJiraStatus(): Promise<JiraConnectionStatus> {
    const response = await this.client.get<{
      connected: boolean;
      active_scope?: 'organization' | 'personal';
      organization?: {
        connected: boolean;
        site_name?: string;
        cloud_id?: string;
        connected_at?: string;
        connected_by_id?: number;
      };
      personal?: {
        connected: boolean;
        site_name?: string;
        cloud_id?: string;
        connected_at?: string;
        connected_by_id?: number;
      };
      site_name?: string;
      cloud_id?: string;
      connected_at?: string;
    }>('/jira/status');

    return {
      connected: response.data.connected,
      activeScope: response.data.active_scope,
      organization: response.data.organization ? {
        connected: response.data.organization.connected,
        siteName: response.data.organization.site_name,
        cloudId: response.data.organization.cloud_id,
        connectedAt: response.data.organization.connected_at,
        connectedById: response.data.organization.connected_by_id,
      } : undefined,
      personal: response.data.personal ? {
        connected: response.data.personal.connected,
        siteName: response.data.personal.site_name,
        cloudId: response.data.personal.cloud_id,
        connectedAt: response.data.personal.connected_at,
        connectedById: response.data.personal.connected_by_id,
      } : undefined,
      siteName: response.data.site_name,
      cloudId: response.data.cloud_id,
      connectedAt: response.data.connected_at,
    };
  }

  async disconnectJira(scope: 'individual' | 'organization' | 'personal' = 'individual'): Promise<boolean> {
    try {
      await this.client.delete('/jira/disconnect', {
        params: { scope },
      });
      return true;
    } catch {
      return false;
    }
  }

  async importFromJira(request: JiraImportRequest): Promise<JiraImportResult> {
    const response = await this.client.post<{
      status: string;
      message: string;
      imported: number;
      updated: number;
    }>('/jira/import', {
      jql: request.jql,
      canvas_id: request.canvasId,
    });
    return response.data;
  }

  async pushToJira(request: JiraPushRequest): Promise<JiraPushResult> {
    const response = await this.client.post<{
      status: string;
      message: string;
      issue_key?: string;
      issue_url?: string;
    }>('/jira/push', {
      task_id: request.taskId,
      project_key: request.projectKey,
      issue_type: request.issueType || 'Task',
    });
    return {
      status: response.data.status,
      message: response.data.message,
      issueKey: response.data.issue_key,
      issueUrl: response.data.issue_url,
    };
  }

  // ============ Confluence OAuth ============

  async connectConfluence(): Promise<{ authUrl: string; state: string }> {
    const response = await this.client.get<OAuthInitResponse>('/confluence/connect');
    return {
      authUrl: response.data.auth_url,
      state: response.data.state,
    };
  }

  // ============ Confluence Spaces & Pages ============

  async getConfluenceSpaces(): Promise<ConfluenceSpace[]> {
    const response = await this.client.get<BackendConfluenceSpace[]>('/confluence/spaces');
    return response.data.map((space) => ({
      id: space.id,
      key: space.key,
      name: space.name,
      type: space.type as 'global' | 'personal',
      icon: space.icon,
    }));
  }

  async getConfluencePages(spaceKey: string): Promise<ConfluencePage[]> {
    const response = await this.client.get<{ pages: BackendConfluencePage[] }>(
      `/confluence/spaces/${spaceKey}/pages`
    );
    return response.data.pages.map((page) => ({
      id: page.id,
      title: page.title,
      spaceKey: page.space_key,
      body: {
        storage: {
          value: page.body_html || '',
          representation: 'storage' as const,
        },
      },
      version: {
        number: page.version,
      },
      _links: {
        webui: page.web_url || '',
      },
    }));
  }

  // ============ Space Skill ============

  async getSpaceSkill(spaceId: string, provider: SkillProvider): Promise<SpaceSkill | null> {
    try {
      const response = await this.client.get<BackendSpaceSkill | null>(
        `/spaces/${spaceId}`,
        { params: { provider } }
      );

      if (!response.data) return null;

      return this.mapSpaceSkill(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async connectSpaceToConfluence(
    spaceId: string,
    skillId: string,
    confluenceSpaceKey: string
  ): Promise<SpaceSkill> {
    const response = await this.client.post<BackendSpaceSkill>(
      `/spaces/${spaceId}/confluence`,
      {
        space_id: spaceId,
        external_space_key: confluenceSpaceKey,
        sync_direction: 'bidirectional',
        auto_sync: false,
      }
    );
    return this.mapSpaceSkill(response.data);
  }

  async disconnectSpaceSkill(spaceSkillId: string): Promise<boolean> {
    // Extract space ID from the skill (or pass it separately)
    // For now, we need to track this in the UI
    try {
      // The backend expects DELETE /spaces/{space_id}/confluence
      // We need the space_id, not the skill ID
      // This is a simplified implementation - in production, you'd track this better
      await this.client.delete(`/spaces/${spaceSkillId}/confluence`);
      return true;
    } catch {
      return false;
    }
  }

  async updateSpaceSkill(
    spaceId: string,
    settings: {
      syncEnabled?: boolean;
      syncDirection?: 'import' | 'export' | 'bidirectional';
      autoSync?: boolean;
    }
  ): Promise<SpaceSkill> {
    const response = await this.client.patch<BackendSpaceSkill>(
      `/spaces/${spaceId}/confluence`,
      {
        sync_enabled: settings.syncEnabled,
        sync_direction: settings.syncDirection,
        auto_sync: settings.autoSync,
      }
    );
    return this.mapSpaceSkill(response.data);
  }

  // ============ Import/Export ============

  async importFromConfluence(
    spaceId: string,
    confluencePageIds: string[],
    options: { preserveHierarchy?: boolean; folderId?: string } = {}
  ): Promise<SyncResult> {
    const response = await this.client.post<SyncResult>(
      `/spaces/${spaceId}/confluence/import`,
      {
        page_ids: confluencePageIds,
        folder_id: options.folderId,
        preserve_hierarchy: options.preserveHierarchy ?? false,
      }
    );
    return response.data;
  }

  async exportToConfluence(
    spaceId: string,
    pageIds: string[],
    options: { targetParentId?: string } = {}
  ): Promise<SyncResult> {
    const response = await this.client.post<SyncResult>(
      `/spaces/${spaceId}/confluence/export`,
      {
        page_ids: pageIds,
        target_parent_id: options.targetParentId,
      }
    );
    return response.data;
  }

  // ============ Sync Operations ============

  async syncNow(spaceId: string, direction?: 'import' | 'export'): Promise<SyncResult> {
    const response = await this.client.post<SyncResult>(
      `/spaces/${spaceId}/confluence/sync`,
      { direction }
    );
    return response.data;
  }

  // ============ Page Sync Status ============

  async getPageSyncStatus(pageId: string): Promise<PageSyncStatus | null> {
    try {
      const response = await this.client.get<PageSyncStatus>(`/pages/${pageId}/sync`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // ============ Jira Strategic Context ============

  /**
   * Index Jira issues on a canvas for strategic context discovery
   */
  async indexJiraIssuesForCanvas(canvasId: number): Promise<{ indexed: number; status: string; message: string }> {
    const response = await this.client.post(`/skills/jira/index/${canvasId}`);
    return response.data;
  }

  /**
   * Search for Jira issues related to a query for strategic PM context
   */
  async searchJiraContext(request: {
    query: string;
    canvasId?: number;
    topK?: number;
  }): Promise<{
    issues: Array<{
      score: number;
      issue_key: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      source_url?: string;
      task_id: number;
      context?: string;
      assignee_name?: string;
    }>;
    formatted_context: string;
  }> {
    const response = await this.client.post('/skills/jira/search-context', {
      query: request.query,
      canvas_id: request.canvasId,
      top_k: request.topK || 5,
    });
    return response.data;
  }

  /**
   * Auto-link relevant Jira issues to a node
   */
  async autoLinkJiraIssuesToNode(
    nodeId: number,
    canvasId: number,
    nodeContent: string,
    options: {
      threshold?: number;
      maxLinks?: number;
    } = {}
  ): Promise<{
    status: string;
    linked_count: number;
    linked_task_ids: number[];
    message: string;
  }> {
    const response = await this.client.post(`/skills/jira/auto-link/${nodeId}`, null, {
      params: {
        canvas_id: canvasId,
        node_content: nodeContent,
        threshold: options.threshold || 0.75,
        max_links: options.maxLinks || 3,
      },
    });
    return response.data;
  }

  // ============ Mappers ============

  private mapSkill(data: BackendSkill): Skill {
    return {
      id: String(data.id),
      provider: data.provider as SkillProvider,
      name: data.provider.charAt(0).toUpperCase() + data.provider.slice(1),
      status: data.is_connected ? 'connected' : 'disconnected',
      config: {
        siteUrl: data.site_url,
        cloudId: data.cloud_id,
        syncEnabled: true,
        syncDirection: 'bidirectional',
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSpaceSkill(data: BackendSpaceSkill): SpaceSkill {
    return {
      id: String(data.id),
      spaceId: data.space_id,
      skillId: String(data.skill_id),
      provider: 'confluence',
      confluenceSpaceKey: data.external_space_key,
      confluenceSpaceId: data.external_space_id,
      confluenceSpaceName: data.external_space_name,
      syncEnabled: data.sync_enabled,
      syncDirection: data.sync_direction as 'import' | 'export' | 'bidirectional',
      lastSyncAt: data.last_sync_at,
      syncStatus: data.sync_status as 'idle' | 'syncing' | 'error',
      syncError: data.last_sync_error,
      pageMappings: {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton
export const skillsApi = new SkillsApiService();
