// src/lib/organization-api.ts
import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import {
  Organization,
  OrganizationBrief,
  OrganizationMember,
  MyMembership,
  OrganizationInvitation,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateInvitationRequest,
  UpdateMemberRoleRequest,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
} from '@/types/organization';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

class OrganizationApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/organizations`,
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
        console.warn('Failed to get session for API request');
      }
      return config;
    });
  }

  // ============ Organization CRUD ============

  async listOrganizations(): Promise<OrganizationBrief[]> {
    const response = await this.client.get<OrganizationBrief[]>('/');
    return response.data;
  }

  async getOrganization(orgId: number): Promise<Organization> {
    const response = await this.client.get<Organization>(`/${orgId}`);
    return response.data;
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await this.client.post<Organization>('/', data);
    return response.data;
  }

  async updateOrganization(orgId: number, data: UpdateOrganizationRequest): Promise<Organization> {
    const response = await this.client.put<Organization>(`/${orgId}`, data);
    return response.data;
  }

  async deleteOrganization(orgId: number): Promise<void> {
    await this.client.delete(`/${orgId}`);
  }

  // ============ Member Management ============

  async listMembers(orgId: number): Promise<OrganizationMember[]> {
    const response = await this.client.get<OrganizationMember[]>(`/${orgId}/members`);
    return response.data;
  }

  async updateMemberRole(orgId: number, userId: number, data: UpdateMemberRoleRequest): Promise<OrganizationMember> {
    const response = await this.client.put<OrganizationMember>(`/${orgId}/members/${userId}`, data);
    return response.data;
  }

  async removeMember(orgId: number, userId: number): Promise<void> {
    await this.client.delete(`/${orgId}/members/${userId}`);
  }

  async leaveOrganization(orgId: number): Promise<void> {
    await this.client.post(`/${orgId}/leave`);
  }

  // ============ Invitations ============

  async listInvitations(orgId: number, status?: string): Promise<OrganizationInvitation[]> {
    const params = status ? { status } : {};
    const response = await this.client.get<OrganizationInvitation[]>(`/${orgId}/invitations`, { params });
    return response.data;
  }

  async createInvitation(orgId: number, data: CreateInvitationRequest): Promise<OrganizationInvitation> {
    const response = await this.client.post<OrganizationInvitation>(`/${orgId}/invitations`, data);
    return response.data;
  }

  async revokeInvitation(orgId: number, invitationId: number): Promise<void> {
    await this.client.delete(`/${orgId}/invitations/${invitationId}`);
  }

  async acceptInvitation(data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
    const response = await this.client.post<AcceptInvitationResponse>('/invitations/accept', data);
    return response.data;
  }

  // ============ My Organizations ============

  async getMyMemberships(): Promise<MyMembership[]> {
    const response = await this.client.get<MyMembership[]>('/me/memberships');
    return response.data;
  }
}

// Export singleton instance
export const organizationApi = new OrganizationApiService();

// Export class for custom instances
export { OrganizationApiService };
