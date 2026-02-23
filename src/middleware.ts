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
    // Match home route
    '/home',
    '/home/:path*',
    // Match organization routes
    '/organization',
    '/organization/:path*',
    // Match canvas routes
    '/canvas',
    '/canvas/:path*',
    // Match agents routes
    '/agents',
    '/agents/:path*',
    // Match projects routes
    '/projects',
    '/projects/:path*',
    // Match metrics routes
    '/metrics',
    '/metrics/:path*',
    // Match documents routes
    '/documents',
    '/documents/:path*',
    // Match tasks routes
    '/tasks',
    '/tasks/:path*',
    // Match settings routes
    '/settings',
    '/settings/:path*',
    // Match meetings routes
    '/meetings',
    '/meetings/:path*',
    // Match integrations routes
    '/integrations',
    '/integrations/:path*',
    // Match OKRs routes
    '/okrs',
    '/okrs/:path*',
    // Match timeline routes
    '/timeline',
    '/timeline/:path*',
    // Match sprints routes
    '/sprints',
    '/sprints/:path*',
    // Match roadmap routes
    '/roadmap',
    '/roadmap/:path*',
    // Match decisions routes
    '/decisions',
    '/decisions/:path*',
    // Match research routes
    '/research',
    '/research/:path*',
  ],
};
