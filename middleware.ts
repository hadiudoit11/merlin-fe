// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow authenticated requests through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        const publicRoutes = [
          '/user/login',
          '/user/register',
          '/auth/error',
          '/invite',
          '/',
        ];

        // Check if current path is a public route
        const isPublicRoute = publicRoutes.some(route =>
          pathname === route || pathname.startsWith(`${route}/`)
        );

        // Allow public routes without token
        if (isPublicRoute) {
          return true;
        }

        // Require token for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: '/user/login',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
