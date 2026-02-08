/**
 * Integrations API Client
 *
 * Handles connections to external services like Confluence, Notion, etc.
 * All integration logic runs on the backend - this client just proxies requests.
 */

import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import {
  Integration,
  IntegrationProvider,
  SpaceIntegration,
  ConfluenceSpace,
  ConfluencePage,
  PageSyncStatus,
  SyncResult,
} from '@/types/integrations';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Backend response types (match backend schemas)
interface BackendIntegration {
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

interface BackendSpaceIntegration {
  id: number;
  integration_id: number;
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

class IntegrationsApiService {
  private client: AxiosInstance;
  private organizationId: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/integrations`,
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
        console.warn('Failed to get session for integration API request');
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

  // ============ Integration Connections ============

  async listIntegrations(): Promise<Integration[]> {
    const response = await this.client.get<BackendIntegration[]>('/');
    return response.data.map(this.mapIntegration);
  }

  async getIntegration(provider: IntegrationProvider): Promise<Integration | null> {
    try {
      const response = await this.client.get<BackendIntegration>(`/${provider}`);
      return this.mapIntegration(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async disconnectIntegration(provider: IntegrationProvider): Promise<boolean> {
    try {
      await this.client.delete(`/${provider}`);
      return true;
    } catch {
      return false;
    }
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

  // ============ Space Integration ============

  async getSpaceIntegration(spaceId: string, provider: IntegrationProvider): Promise<SpaceIntegration | null> {
    try {
      const response = await this.client.get<BackendSpaceIntegration | null>(
        `/spaces/${spaceId}`,
        { params: { provider } }
      );

      if (!response.data) return null;

      return this.mapSpaceIntegration(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async connectSpaceToConfluence(
    spaceId: string,
    integrationId: string,
    confluenceSpaceKey: string
  ): Promise<SpaceIntegration> {
    const response = await this.client.post<BackendSpaceIntegration>(
      `/spaces/${spaceId}/confluence`,
      {
        space_id: spaceId,
        external_space_key: confluenceSpaceKey,
        sync_direction: 'bidirectional',
        auto_sync: false,
      }
    );
    return this.mapSpaceIntegration(response.data);
  }

  async disconnectSpaceIntegration(spaceIntegrationId: string): Promise<boolean> {
    // Extract space ID from the integration (or pass it separately)
    // For now, we need to track this in the UI
    try {
      // The backend expects DELETE /spaces/{space_id}/confluence
      // We need the space_id, not the integration ID
      // This is a simplified implementation - in production, you'd track this better
      await this.client.delete(`/spaces/${spaceIntegrationId}/confluence`);
      return true;
    } catch {
      return false;
    }
  }

  async updateSpaceIntegration(
    spaceId: string,
    settings: {
      syncEnabled?: boolean;
      syncDirection?: 'import' | 'export' | 'bidirectional';
      autoSync?: boolean;
    }
  ): Promise<SpaceIntegration> {
    const response = await this.client.patch<BackendSpaceIntegration>(
      `/spaces/${spaceId}/confluence`,
      {
        sync_enabled: settings.syncEnabled,
        sync_direction: settings.syncDirection,
        auto_sync: settings.autoSync,
      }
    );
    return this.mapSpaceIntegration(response.data);
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

  // ============ Mappers ============

  private mapIntegration(data: BackendIntegration): Integration {
    return {
      id: String(data.id),
      provider: data.provider as IntegrationProvider,
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

  private mapSpaceIntegration(data: BackendSpaceIntegration): SpaceIntegration {
    return {
      id: String(data.id),
      spaceId: data.space_id,
      integrationId: String(data.integration_id),
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
export const integrationsApi = new IntegrationsApiService();
