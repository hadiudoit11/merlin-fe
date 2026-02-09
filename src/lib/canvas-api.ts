import axios, { AxiosInstance, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class CanvasApiService {
  private client: AxiosInstance;
  private token: string | null = null;
  private organizationId: number | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor that fetches token from session
    this.client.interceptors.request.use(async (config) => {
      // If we have a manually set token, use it
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      } else {
        // Otherwise, try to get token from NextAuth session
        try {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        } catch (error) {
          console.warn('Failed to get session for API request');
        }
      }

      // Add organization context if set
      if (this.organizationId) {
        config.headers['X-Organization-ID'] = String(this.organizationId);
      }

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - trigger re-auth
          console.error('Unauthorized - token may be expired');
          // Optionally sign out and redirect to login
          if (typeof window !== 'undefined') {
            await signOut({ redirect: true, callbackUrl: '/user/login' });
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  setOrganizationId(orgId: number | null) {
    this.organizationId = orgId;
  }

  getOrganizationId(): number | null {
    return this.organizationId;
  }

  // ============ Canvas Operations ============

  async listCanvases(): Promise<Canvas[]> {
    const response = await this.client.get<Canvas[]>('/canvases/');
    return response.data;
  }

  async getCanvas(canvasId: number): Promise<Canvas> {
    const response = await this.client.get<Canvas>(`/canvases/${canvasId}`);
    return response.data;
  }

  async createCanvas(data: CreateCanvasRequest): Promise<Canvas> {
    const response = await this.client.post<Canvas>('/canvases/', data);
    return response.data;
  }

  async updateCanvas(canvasId: number, data: UpdateCanvasRequest): Promise<Canvas> {
    const response = await this.client.put<Canvas>(`/canvases/${canvasId}`, data);
    return response.data;
  }

  async deleteCanvas(canvasId: number): Promise<void> {
    await this.client.delete(`/canvases/${canvasId}`);
  }

  // ============ Node Operations ============

  async listNodes(canvasId: number): Promise<CanvasNode[]> {
    const response = await this.client.get<CanvasNode[]>('/nodes/', {
      params: { canvas_id: canvasId },
    });
    return response.data;
  }

  async getNode(nodeId: number): Promise<CanvasNode> {
    const response = await this.client.get<CanvasNode>(`/nodes/${nodeId}`);
    return response.data;
  }

  async createNode(data: CreateNodeRequest): Promise<CanvasNode> {
    const response = await this.client.post<CanvasNode>('/nodes/', data);
    return response.data;
  }

  async updateNode(nodeId: number, data: UpdateNodeRequest): Promise<CanvasNode> {
    const response = await this.client.put<CanvasNode>(`/nodes/${nodeId}`, data);
    return response.data;
  }

  async updateNodePosition(
    nodeId: number,
    position_x: number,
    position_y: number
  ): Promise<CanvasNode> {
    const response = await this.client.patch<CanvasNode>(`/nodes/${nodeId}/position`, {
      position_x,
      position_y,
    });
    return response.data;
  }

  async batchUpdatePositions(data: BatchPositionUpdate): Promise<{ status: string; count: number }> {
    const response = await this.client.patch<{ status: string; count: number }>(
      '/nodes/batch/positions',
      data
    );
    return response.data;
  }

  async deleteNode(nodeId: number): Promise<void> {
    await this.client.delete(`/nodes/${nodeId}`);
  }

  // ============ Connection Operations ============

  async createConnection(data: CreateConnectionRequest): Promise<NodeConnection> {
    const response = await this.client.post<NodeConnection>('/nodes/connections', data);
    return response.data;
  }

  async deleteConnection(connectionId: number): Promise<void> {
    await this.client.delete(`/nodes/connections/${connectionId}`);
  }

  // ============ OKR Operations ============

  async listObjectives(params?: { level?: string; status?: string }): Promise<Objective[]> {
    const response = await this.client.get<Objective[]>('/okrs/objectives', { params });
    return response.data;
  }

  async getObjective(objectiveId: number): Promise<Objective> {
    const response = await this.client.get<Objective>(`/okrs/objectives/${objectiveId}`);
    return response.data;
  }

  async createObjective(data: Partial<Objective>): Promise<Objective> {
    const response = await this.client.post<Objective>('/okrs/objectives', data);
    return response.data;
  }

  async updateObjective(objectiveId: number, data: Partial<Objective>): Promise<Objective> {
    const response = await this.client.put<Objective>(`/okrs/objectives/${objectiveId}`, data);
    return response.data;
  }

  async deleteObjective(objectiveId: number): Promise<void> {
    await this.client.delete(`/okrs/objectives/${objectiveId}`);
  }

  async createKeyResult(data: Partial<KeyResult>): Promise<KeyResult> {
    const response = await this.client.post<KeyResult>('/okrs/key-results', data);
    return response.data;
  }

  async updateKeyResult(krId: number, data: Partial<KeyResult>): Promise<KeyResult> {
    const response = await this.client.put<KeyResult>(`/okrs/key-results/${krId}`, data);
    return response.data;
  }

  async deleteKeyResult(krId: number): Promise<void> {
    await this.client.delete(`/okrs/key-results/${krId}`);
  }

  // ============ Metrics Operations ============

  async listMetrics(): Promise<Metric[]> {
    const response = await this.client.get<Metric[]>('/metrics/');
    return response.data;
  }

  async getMetric(metricId: number): Promise<Metric> {
    const response = await this.client.get<Metric>(`/metrics/${metricId}`);
    return response.data;
  }

  async createMetric(data: Partial<Metric>): Promise<Metric> {
    const response = await this.client.post<Metric>('/metrics/', data);
    return response.data;
  }

  async updateMetric(metricId: number, data: Partial<Metric>): Promise<Metric> {
    const response = await this.client.put<Metric>(`/metrics/${metricId}`, data);
    return response.data;
  }

  async updateMetricValue(metricId: number, value: number): Promise<Metric> {
    const response = await this.client.patch<Metric>(`/metrics/${metricId}/value`, { value });
    return response.data;
  }

  async deleteMetric(metricId: number): Promise<void> {
    await this.client.delete(`/metrics/${metricId}`);
  }

  // ============ Canvas Agent Operations ============

  async chatWithCanvasAgent(
    canvasId: number,
    message: string,
    conversationHistory?: Array<{ role: string; content: unknown }>
  ): Promise<{
    response: string;
    actions: Array<{
      type: string;
      description: string;
      status: string;
      params: Record<string, unknown>;
    }>;
  }> {
    const response = await this.client.post(`/agent/${canvasId}/chat`, {
      message,
      conversation_history: conversationHistory,
    });
    return response.data;
  }
}

// Export singleton instance
export const canvasApi = new CanvasApiService();

// Export class for custom instances
export { CanvasApiService };
