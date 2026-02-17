'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useDomainCheck } from '@/hooks/useDomainCheck';
import { JoinOrgModal } from './JoinOrgModal';
import { OrganizationBrief } from '@/types/organization';

interface DomainCheckContextValue {
  isChecking: boolean;
  hasChecked: boolean;
  hasMatchingOrg: boolean;
  organization?: OrganizationBrief;
  isMember: boolean;
}

const DomainCheckContext = createContext<DomainCheckContextValue>({
  isChecking: false,
  hasChecked: false,
  hasMatchingOrg: false,
  isMember: false,
});

export function useDomainCheckContext() {
  return useContext(DomainCheckContext);
}

interface DomainCheckProviderProps {
  children: ReactNode;
}

export function DomainCheckProvider({ children }: DomainCheckProviderProps) {
  const {
    isChecking,
    hasChecked,
    result,
    showJoinModal,
    setShowJoinModal,
    handleJoined,
    handleDeclined,
  } = useDomainCheck();

  const contextValue: DomainCheckContextValue = {
    isChecking,
    hasChecked,
    hasMatchingOrg: result?.hasMatchingOrg ?? false,
    organization: result?.organization,
    isMember: result?.isMember ?? false,
  };

  return (
    <DomainCheckContext.Provider value={contextValue}>
      {children}

      {/* Join Organization Modal */}
      {result?.organization && !result.isMember && !result.requireSso && (
        <JoinOrgModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          organization={result.organization}
          autoJoin={result.autoJoin}
          onJoined={handleJoined}
          onDeclined={handleDeclined}
        />
      )}
    </DomainCheckContext.Provider>
  );
}
