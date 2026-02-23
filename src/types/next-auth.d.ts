// src/types/next-auth.d.ts

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    provider?: string;
    error?: string;
    user: {
      id?: number;
      email: string;
      organization?: number;
      organization_name?: string;
      emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: number;
    access_token: string;
    refresh_token?: string;
    access_token_expires_in?: number;
    email: string;
    organization?: number;
    organization_name?: string;
    email_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    provider?: string;
    error?: string;
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    organization?: number;
    organization_name?: string;
    userId?: number;
    emailVerified?: boolean;
  }
}