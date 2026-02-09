'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

interface UseAuthReturn {
  session: ReturnType<typeof useSession>['data'];
  status: ReturnType<typeof useSession>['status'];
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    email?: string;
    name?: string;
    image?: string;
    organization?: number;
    organization_name?: string;
  } | null;
}

/**
 * Custom hook for handling authentication state and protection.
 *
 * @param options - Configuration options
 * @param options.required - Whether authentication is required (default: true)
 * @param options.redirectTo - Where to redirect if unauthenticated (default: '/user/login')
 * @param options.onUnauthenticated - Callback when user is unauthenticated
 *
 * @example
 * // Basic usage - redirects to login if not authenticated
 * const { user, isLoading } = useAuth();
 *
 * @example
 * // With custom redirect
 * const { user } = useAuth({ redirectTo: '/user/login?callbackUrl=/dashboard' });
 *
 * @example
 * // Optional auth (doesn't redirect)
 * const { user, isAuthenticated } = useAuth({ required: false });
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { required = true, redirectTo = '/user/login', onUnauthenticated } = options;
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    // Only redirect if auth is required and user is confirmed unauthenticated
    if (required && status === 'unauthenticated') {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        router.push(redirectTo);
      }
    }
  }, [required, status, router, redirectTo, onUnauthenticated]);

  const user = session?.user
    ? {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
        organization: session.user.organization,
        organization_name: session.user.organization_name,
      }
    : null;

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    user,
  };
}

/**
 * Hook to check if user has a specific permission.
 * This is a placeholder - implement based on your permission system.
 */
export function usePermission(permission: string): boolean {
  const { session } = useAuth({ required: false });

  // TODO: Implement permission checking logic based on your backend
  // For now, return true if authenticated
  return !!session;
}

/**
 * Hook to get the current organization context.
 */
export function useOrganization() {
  const { user, isLoading } = useAuth({ required: false });

  return {
    organizationId: user?.organization ?? null,
    organizationName: user?.organization_name ?? null,
    isLoading,
    hasOrganization: !!user?.organization,
  };
}
