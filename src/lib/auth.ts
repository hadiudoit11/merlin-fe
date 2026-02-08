// src/lib/auth.ts
import { signIn, signOut, getSession } from 'next-auth/react';
import type { Session } from 'next-auth';

/**
 * Sign in with Auth0 (primary authentication)
 */
export async function signInWithAuth0(callbackUrl?: string) {
  return signIn('auth0', { callbackUrl: callbackUrl || '/home' });
}

/**
 * Sign in with email/password (legacy credentials)
 */
export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string
) {
  return signIn('credentials', {
    email,
    password,
    callbackUrl: callbackUrl || '/home',
    redirect: true,
  });
}

/**
 * Sign out and redirect to login
 */
export async function logout(callbackUrl?: string) {
  return signOut({ callbackUrl: callbackUrl || '/user/login' });
}

/**
 * Get current session (server-side or client-side)
 */
export async function getCurrentSession(): Promise<Session | null> {
  return getSession();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.accessToken;
}

/**
 * Get access token from session
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

/**
 * Get user organization ID from session
 */
export async function getUserOrganization(): Promise<number | null> {
  const session = await getSession();
  return session?.user?.organization || null;
}

/**
 * Check if Auth0 is configured (for conditional UI rendering)
 */
export function isAuth0Configured(): boolean {
  return !!(
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET &&
    process.env.AUTH0_ISSUER
  );
}
