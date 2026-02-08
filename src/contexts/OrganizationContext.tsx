'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationBrief, MyMembership, OrganizationRole } from '@/types/organization';
import { organizationApi } from '@/lib/organization-api';
import { canvasApi } from '@/lib/canvas-api';

interface OrganizationContextType {
  // Current organization context
  currentOrganization: OrganizationBrief | null;
  setCurrentOrganization: (org: OrganizationBrief | null) => void;

  // All memberships
  memberships: MyMembership[];
  isLoadingMemberships: boolean;
  refreshMemberships: () => Promise<void>;

  // Helper functions
  getCurrentRole: () => OrganizationRole | null;
  isPersonalMode: boolean;
  switchToPersonal: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [currentOrganization, setCurrentOrganizationState] = useState<OrganizationBrief | null>(null);
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false);

  // Load memberships when session is available
  const refreshMemberships = useCallback(async () => {
    if (status !== 'authenticated') return;

    setIsLoadingMemberships(true);
    try {
      const data = await organizationApi.getMyMemberships();
      setMemberships(data);
    } catch (error) {
      console.error('Failed to load memberships:', error);
      setMemberships([]);
    } finally {
      setIsLoadingMemberships(false);
    }
  }, [status]);

  useEffect(() => {
    refreshMemberships();
  }, [refreshMemberships]);

  // Set organization and update API client
  const setCurrentOrganization = useCallback((org: OrganizationBrief | null) => {
    setCurrentOrganizationState(org);
    canvasApi.setOrganizationId(org?.id || null);

    // Persist to localStorage
    if (org) {
      localStorage.setItem('currentOrgId', String(org.id));
    } else {
      localStorage.removeItem('currentOrgId');
    }
  }, []);

  // Restore org from localStorage on mount
  useEffect(() => {
    const savedOrgId = localStorage.getItem('currentOrgId');
    if (savedOrgId && memberships.length > 0) {
      const membership = memberships.find(m => m.organization.id === Number(savedOrgId));
      if (membership) {
        setCurrentOrganization(membership.organization);
      }
    }
  }, [memberships, setCurrentOrganization]);

  const getCurrentRole = useCallback((): OrganizationRole | null => {
    if (!currentOrganization) return null;
    const membership = memberships.find(m => m.organization.id === currentOrganization.id);
    return membership?.role || null;
  }, [currentOrganization, memberships]);

  const switchToPersonal = useCallback(() => {
    setCurrentOrganization(null);
  }, [setCurrentOrganization]);

  const isPersonalMode = currentOrganization === null;

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        memberships,
        isLoadingMemberships,
        refreshMemberships,
        getCurrentRole,
        isPersonalMode,
        switchToPersonal,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
