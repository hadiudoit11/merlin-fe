// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, Session, Account } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';
import CredentialsProvider from 'next-auth/providers/credentials';
import Auth0Provider from 'next-auth/providers/auth0';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import GitHubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';

// Check provider configurations
const isAuth0Configured = !!(
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET &&
  process.env.AUTH0_ISSUER
);

const isGoogleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
);

const isDiscordConfigured = !!(
  process.env.DISCORD_CLIENT_ID &&
  process.env.DISCORD_CLIENT_SECRET
);

const isGitHubConfigured = !!(
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET
);

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendURL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Build providers list - Social providers first (primary), then SSO, then legacy
const providers: Provider[] = [];

// Social Providers (Primary auth methods for individual users)
if (isGoogleConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
}

if (isDiscordConfigured) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    })
  );
}

if (isGitHubConfigured) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  );
}

// Auth0 provider for SSO/Enterprise (secondary - for org members)
if (isAuth0Configured) {
  providers.push(
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      authorization: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email',
        },
      },
    })
  );
}

// Credentials provider for legacy/fallback auth (hidden from main UI)
providers.push(
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (credentials) => {
      const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendURL}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const user = await res.json();

      if (res.ok && user) {
        return {
          ...user,
          organization: user.organization,
          organization_name: user.organization_name,
        };
      } else {
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET_KEY,
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: Account | null }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        // Social providers (Google, Discord, GitHub)
        if (['google', 'discord', 'github'].includes(account.provider)) {
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
          token.provider = account.provider;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image || user.picture;
          token.sub = account.providerAccountId;
        }
        // Auth0 login (SSO/Enterprise)
        else if (account.provider === 'auth0') {
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
          token.provider = 'auth0';
          token.email = user.email;
          token.name = user.name;
          token.picture = user.picture;
          token.sub = account.providerAccountId;
        }
        // Credentials login (legacy)
        else if (account.provider === 'credentials') {
          token.accessToken = user.access_token;
          token.refreshToken = user.refresh_token;
          token.accessTokenExpires = user.access_token_expires_in
            ? Date.now() + user.access_token_expires_in * 1000
            : undefined;
          token.provider = 'credentials';
          token.email = user.email;
          token.organization = user.organization;
          token.organization_name = user.organization_name;
        }
      }

      // Return token (no refresh for credentials - backend doesn't support it)
      // User will need to re-login when token expires
      if (token.provider === 'credentials') {
        // Check if token is expired
        if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) {
          // Token expired - mark as error so user re-authenticates
          return {
            ...token,
            error: 'TokenExpiredError',
          };
        }
        return token;
      }

      // For OAuth providers, tokens are managed by the provider
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      // Pass token data to session
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.provider = token.provider as string;

      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.organization = token.organization as number | undefined;
        session.user.organization_name = token.organization_name as string | undefined;
      }

      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/user/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);