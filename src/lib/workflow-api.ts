import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

// ---------------------------------------------------------------------------
// Stage metadata
// ---------------------------------------------------------------------------

export const WORKFLOW_STAGES = [
  { key: 'research', label: 'Research' },
  { key: 'prd_review', label: 'PRD Review' },
  { key: 'ux_review', label: 'UX Review' },
  { key: 'tech_spec', label: 'Tech Spec' },
  { key: 'project_kickoff', label: 'Kickoff' },
  { key: 'development', label: 'Development' },
  { key: 'qa', label: 'QA' },
  { key: 'launch', label: 'Launch' },
  { key: 'retrospective', label: 'Retrospective' },
] as const;

export type WorkflowStageKey = (typeof WORKFLOW_STAGES)[number]['key'];

// ---------------------------------------------------------------------------
// Response types (mirrors backend schemas)
// ---------------------------------------------------------------------------

export interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  current_stage: WorkflowStageKey;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  canvas_id?: number;
  created_at: string;
  updated_at: string;
}

export interface StageTransitionResponse {
  id: number;
  project_id: number;
  from_stage: WorkflowStageKey;
  to_stage: WorkflowStageKey;
  notes?: string;
  created_at: string;
}

export interface ChangeProposalResponse {
  id: number;
  title: string;
  description?: string;
  change_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'superseded' | 'expired';
  project_id: number;
  artifact_id?: number;
  ai_rationale?: string;
  created_at: string;
}

export interface ProjectWithDetailsResponse extends ProjectResponse {
  artifacts: Array<{ id: number; name: string; artifact_type: string; status: string }>;
  pending_proposals: ChangeProposalResponse[];
  transitions: StageTransitionResponse[];
}

// ---------------------------------------------------------------------------
// API service
// ---------------------------------------------------------------------------

class WorkflowApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use(async (config) => {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch {
        // Proceed without auth if session unavailable
      }
      return config;
    });
  }

  /** List all projects attached to a canvas. */
  async listProjects(canvasId: number): Promise<ProjectResponse[]> {
    const res = await this.client.get<ProjectResponse[]>('/projects/', {
      params: { canvas_id: canvasId },
    });
    return res.data;
  }

  /** Get full project details including artifacts, pending proposals, and transitions. */
  async getProjectDetails(projectId: number): Promise<ProjectWithDetailsResponse> {
    const res = await this.client.get<ProjectWithDetailsResponse>(
      `/projects/${projectId}/details`
    );
    return res.data;
  }

  /** Advance a project to the next (or any specified) stage. */
  async transitionStage(
    projectId: number,
    toStage: WorkflowStageKey,
    notes?: string
  ): Promise<StageTransitionResponse> {
    const res = await this.client.post<StageTransitionResponse>(
      `/projects/${projectId}/transitions`,
      { to_stage: toStage, notes }
    );
    return res.data;
  }

  /** List change proposals for a project, optionally filtered by status. */
  async listProposals(
    projectId: number,
    status?: string
  ): Promise<ChangeProposalResponse[]> {
    const res = await this.client.get<ChangeProposalResponse[]>('/change-proposals/', {
      params: { project_id: projectId, ...(status ? { status } : {}) },
    });
    return res.data;
  }

  /** Approve a change proposal. */
  async approveProposal(
    proposalId: number,
    reviewNotes?: string
  ): Promise<ChangeProposalResponse> {
    const res = await this.client.post<ChangeProposalResponse>(
      `/change-proposals/${proposalId}/approve`,
      { review_notes: reviewNotes ?? '' }
    );
    return res.data;
  }

  /** Reject a change proposal. */
  async rejectProposal(
    proposalId: number,
    reviewNotes: string
  ): Promise<ChangeProposalResponse> {
    const res = await this.client.post<ChangeProposalResponse>(
      `/change-proposals/${proposalId}/reject`,
      { review_notes: reviewNotes }
    );
    return res.data;
  }
}

export const workflowApi = new WorkflowApiService();
