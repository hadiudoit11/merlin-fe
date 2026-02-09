import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If user is authenticated, continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/user/login',
    },
  }
);

// Protect all routes under (dashboard) and other protected areas
export const config = {
  matcher: [
    // Match all dashboard routes
    '/(dashboard)/:path*',
    // Match organization routes
    '/organization/:path*',
    // Match canvas routes
    '/canvas/:path*',
    // Match agents routes
    '/agents/:path*',
    // Match projects routes
    '/projects/:path*',
    // Match metrics routes
    '/metrics/:path*',
    // Match documents routes
    '/documents/:path*',
    // Match home (dashboard home)
    '/home/:path*',
    // Exclude auth-related routes, static files, and API routes
  ],
};
