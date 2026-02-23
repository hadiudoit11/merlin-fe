/**
 * Task API client for interacting with Merlin backend.
 */

import axios from 'axios';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskStats,
  TaskFilters,
} from '@/types/task';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Get token from localStorage or session
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskApi = {
  /**
   * List tasks with optional filters
   */
  async listTasks(filters?: TaskFilters): Promise<TaskListResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.canvas_id) params.append('canvas_id', String(filters.canvas_id));
    if (filters?.assignee_email) params.append('assignee_email', filters.assignee_email);
    if (filters?.overdue !== undefined) params.append('overdue', String(filters.overdue));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.page_size) params.append('page_size', String(filters.page_size));

    const response = await apiClient.get<TaskListResponse>(`/tasks/?${params.toString()}`);
    return response.data;
  },

  /**
   * Get task statistics
   */
  async getTaskStats(canvasId?: number): Promise<TaskStats> {
    const params = canvasId ? `?canvas_id=${canvasId}` : '';
    const response = await apiClient.get<TaskStats>(`/tasks/stats${params}`);
    return response.data;
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  async createTask(data: TaskCreate): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/', data);
    return response.data;
  },

  /**
   * Update a task
   */
  async updateTask(taskId: number, data: TaskUpdate): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  /**
   * Link a task to a canvas node
   */
  async linkTaskToNode(taskId: number, nodeId: number): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/link/${nodeId}`);
    return response.data;
  },

  /**
   * Unlink a task from a canvas node
   */
  async unlinkTaskFromNode(taskId: number, nodeId: number): Promise<Task> {
    const response = await apiClient.delete<Task>(`/tasks/${taskId}/link/${nodeId}`);
    return response.data;
  },

  /**
   * Update task status (convenience method)
   */
  async updateTaskStatus(taskId: number, status: Task['status']): Promise<Task> {
    return this.updateTask(taskId, { status });
  },

  /**
   * Assign task to someone (convenience method)
   */
  async assignTask(taskId: number, assigneeName: string, assigneeEmail?: string): Promise<Task> {
    return this.updateTask(taskId, {
      assignee_name: assigneeName,
      assignee_email: assigneeEmail,
    });
  },
};

// Mock API for development without backend
const mockTasks: Task[] = [];

export const mockTaskApi = {
  async listTasks(filters?: TaskFilters): Promise<TaskListResponse> {
    let filtered = [...mockTasks];

    if (filters?.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters?.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    if (filters?.canvas_id) {
      filtered = filtered.filter(t => t.canvas_id === filters.canvas_id);
    }

    const page = filters?.page || 1;
    const pageSize = filters?.page_size || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      tasks: filtered.slice(start, end),
      total: filtered.length,
      page,
      page_size: pageSize,
    };
  },

  async getTaskStats(canvasId?: number): Promise<TaskStats> {
    const tasks = canvasId
      ? mockTasks.filter(t => t.canvas_id === canvasId)
      : mockTasks;

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.is_overdue).length,
    };
  },

  async getTask(taskId: number): Promise<Task> {
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  },

  async createTask(data: TaskCreate): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: Date.now(),
      title: data.title,
      description: data.description || null,
      assignee_name: data.assignee_name || null,
      assignee_email: data.assignee_email || null,
      assignee_avatar: data.assignee_avatar || null,
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      due_date_text: data.due_date_text || null,
      status: 'pending',
      priority: data.priority || 'medium',
      source: 'manual',
      source_id: null,
      source_url: null,
      context: null,
      canvas_id: data.canvas_id || null,
      tags: data.tags || [],
      is_overdue: false,
      linked_nodes: [],
      // Trello-like features
      labels: data.labels || [],
      checklists: data.checklists || [],
      cover: data.cover || null,
      attachment_count: 0,
      comment_count: 0,
      created_at: now,
      updated_at: now,
    };
    mockTasks.push(task);
    return task;
  },

  async updateTask(taskId: number, data: TaskUpdate): Promise<Task> {
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    mockTasks[index] = {
      ...mockTasks[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockTasks[index];
  },

  async deleteTask(taskId: number): Promise<void> {
    const index = mockTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      mockTasks.splice(index, 1);
    }
  },

  async linkTaskToNode(taskId: number, nodeId: number): Promise<Task> {
    const task = await this.getTask(taskId);
    // Mock implementation
    return task;
  },

  async unlinkTaskFromNode(taskId: number, nodeId: number): Promise<Task> {
    const task = await this.getTask(taskId);
    return task;
  },

  async updateTaskStatus(taskId: number, status: Task['status']): Promise<Task> {
    return this.updateTask(taskId, { status });
  },

  async assignTask(taskId: number, assigneeName: string, assigneeEmail?: string): Promise<Task> {
    return this.updateTask(taskId, {
      assignee_name: assigneeName,
      assignee_email: assigneeEmail,
    });
  },
};

// Export based on environment
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
export const tasks = USE_MOCK_API ? mockTaskApi : taskApi;

export default tasks;
