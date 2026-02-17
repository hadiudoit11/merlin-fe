'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { organizationApi } from '@/lib/organization-api';
import { OrganizationBrief } from '@/types/organization';

interface DomainCheckResult {
  hasMatchingOrg: boolean;
  organization?: OrganizationBrief;
  requireSso: boolean;
  autoJoin: boolean;
  isMember: boolean;
  ssoUrl?: string;
}

interface UseDomainCheckReturn {
  isChecking: boolean;
  hasChecked: boolean;
  result: DomainCheckResult | null;
  showJoinModal: boolean;
  setShowJoinModal: (show: boolean) => void;
  handleJoined: (org: OrganizationBrief) => void;
  handleDeclined: () => void;
  checkDomain: () => Promise<void>;
}

const DOMAIN_CHECK_KEY = 'merlin_domain_checked';
const DOMAIN_DECLINED_KEY = 'merlin_domain_declined';

export function useDomainCheck(): UseDomainCheckReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const checkDomain = useCallback(async () => {
    if (status !== 'authenticated' || !session?.accessToken) {
      return;
    }

    // Check if already checked this session
    const sessionChecked = sessionStorage.getItem(DOMAIN_CHECK_KEY);
    if (sessionChecked) {
      setHasChecked(true);
      return;
    }

    // Check if user previously declined
    const declined = localStorage.getItem(DOMAIN_DECLINED_KEY);
    if (declined) {
      setHasChecked(true);
      sessionStorage.setItem(DOMAIN_CHECK_KEY, 'true');
      return;
    }

    setIsChecking(true);
    try {
      const checkResult = await organizationApi.checkDomainOrganization();
      setResult(checkResult);
      setHasChecked(true);
      sessionStorage.setItem(DOMAIN_CHECK_KEY, 'true');

      // Handle different scenarios
      if (checkResult.hasMatchingOrg && !checkResult.isMember) {
        if (checkResult.requireSso && checkResult.ssoUrl) {
          // Redirect to SSO
          router.push(checkResult.ssoUrl);
        } else {
          // Show join modal
          setShowJoinModal(true);
        }
      }
    } catch (error) {
      console.warn('Domain check failed:', error);
      setHasChecked(true);
      sessionStorage.setItem(DOMAIN_CHECK_KEY, 'true');
    } finally {
      setIsChecking(false);
    }
  }, [session?.accessToken, status, router]);

  // Run check when authenticated
  useEffect(() => {
    if (status === 'authenticated' && !hasChecked && !isChecking) {
      checkDomain();
    }
  }, [status, hasChecked, isChecking, checkDomain]);

  const handleJoined = useCallback((org: OrganizationBrief) => {
    setShowJoinModal(false);
    // Optionally redirect to org dashboard
    router.push(`/home?org=${org.id}`);
  }, [router]);

  const handleDeclined = useCallback(() => {
    setShowJoinModal(false);
    // Remember the decline so we don't ask again
    localStorage.setItem(DOMAIN_DECLINED_KEY, 'true');
  }, []);

  return {
    isChecking,
    hasChecked,
    result,
    showJoinModal,
    setShowJoinModal,
    handleJoined,
    handleDeclined,
    checkDomain,
  };
}
