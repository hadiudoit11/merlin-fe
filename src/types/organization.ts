// src/types/organization.ts

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  allow_member_invites: boolean;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface OrganizationBrief {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface OrganizationMember {
  id: number;
  user_id: number;
  role: OrganizationRole;
  joined_at: string;
  user_email?: string;
  user_name?: string;
  user_picture?: string;
}

export interface MyMembership {
  organization: OrganizationBrief;
  role: OrganizationRole;
  joined_at: string;
}

export interface OrganizationInvitation {
  id: number;
  email: string;
  role: OrganizationRole;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  invited_by_name?: string;
  organization_name?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  allow_member_invites?: boolean;
}

export interface CreateInvitationRequest {
  email: string;
  role?: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  organization: OrganizationBrief;
  role: OrganizationRole;
  message: string;
}
