// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, Session, Account } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';
import CredentialsProvider from 'next-auth/providers/credentials';
// SSO providers commented out - email-only authentication
// import Auth0Provider from 'next-auth/providers/auth0';
// import GoogleProvider from 'next-auth/providers/google';
// import DiscordProvider from 'next-auth/providers/discord';
// import GitHubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';

/*
 * SSO Provider Configurations - Commented out for email-only auth
 * Uncomment these to re-enable social login providers
 *
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
*/

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

// Build providers list - Email/password only (SSO providers commented out)
const providers: Provider[] = [];

/*
 * SSO Providers - Commented out for email-only authentication
 * Uncomment to re-enable social login
 *
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
*/

// Credentials provider - Primary auth method (email/password)
providers.push(
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (credentials) => {
      const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

      // Backend expects form data with 'username' field (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', credentials?.email || '');
      formData.append('password', credentials?.password || '');

      const res = await fetch(`${backendURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!res.ok) {
        return null;
      }

      const tokenData = await res.json();

      // Fetch user info with the token
      const userRes = await fetch(`${backendURL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        return null;
      }

      const userData = await userRes.json();

      return {
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.email,
        access_token: tokenData.access_token,
        organization: userData.organization_id,
        organization_name: userData.organization_name,
        // Email verification status from backend
        email_verified: userData.email_verified ?? false,
      };
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
        /*
         * SSO Provider Handling - Commented out for email-only auth
         * Uncomment to re-enable social login
         *
        // Social providers (Google, Discord, GitHub) - exchange for backend token
        if (['google', 'discord', 'github'].includes(account.provider)) {
          const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

          try {
            // Exchange social login for backend JWT
            const exchangeResponse = await fetch(`${backendURL}/api/v1/auth/social-exchange`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                picture: user.image || user.picture,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
              }),
            });

            if (exchangeResponse.ok) {
              const backendUser = await exchangeResponse.json();
              token.accessToken = backendUser.access_token;
              token.accessTokenExpires = Date.now() + backendUser.access_token_expires_in * 1000;
              token.provider = account.provider;
              token.email = backendUser.email;
              token.name = backendUser.name;
              token.picture = backendUser.image;
              token.sub = account.providerAccountId;
              token.userId = backendUser.id;
              token.emailVerified = true; // Social providers are pre-verified
            } else {
              console.error('Failed to exchange social token:', await exchangeResponse.text());
              token.accessToken = account.access_token;
              token.idToken = account.id_token;
              token.provider = account.provider;
              token.email = user.email;
              token.name = user.name;
              token.picture = user.image || user.picture;
              token.sub = account.providerAccountId;
              token.error = 'SocialExchangeError';
            }
          } catch (error) {
            console.error('Social token exchange error:', error);
            token.accessToken = account.access_token;
            token.provider = account.provider;
            token.email = user.email;
            token.name = user.name;
            token.picture = user.image || user.picture;
            token.sub = account.providerAccountId;
            token.error = 'SocialExchangeError';
          }
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
          token.emailVerified = true; // Auth0 SSO users are pre-verified
        }
        // Credentials login (primary)
        else
        */
        if (account.provider === 'credentials') {
          token.accessToken = user.access_token;
          token.refreshToken = user.refresh_token;
          token.accessTokenExpires = user.access_token_expires_in
            ? Date.now() + user.access_token_expires_in * 1000
            : undefined;
          token.provider = 'credentials';
          token.email = user.email;
          token.organization = user.organization;
          token.organization_name = user.organization_name;
          // Email verification status from backend
          token.emailVerified = user.email_verified ?? false;
          token.userId = user.id;
        }
      }

      // Check if token is expired for social/credentials providers
      if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) {
        // Token expired - mark as error so user re-authenticates
        return {
          ...token,
          error: 'TokenExpiredError',
        };
      }

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
        session.user.id = token.userId as number | undefined;
        // Email verification status - critical for gating access
        session.user.emailVerified = token.emailVerified as boolean | undefined;
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