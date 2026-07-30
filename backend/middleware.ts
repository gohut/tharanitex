import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from './types/auth';

// Paths that require authentication
const PROTECTED_ROUTES = [
  '/api/auth/session',
  '/api/cart',
  '/api/orders',
  '/api/user/profile',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path requires authentication check
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = sessionCookie?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication required. Invalid or missing session.',
        error: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // Clone request headers and attach session token for API route handlers
  const requestHeaders = new Headers(request.headers);
  if (token) {
    requestHeaders.set('x-session-token', token);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all API routes except static files & Next.js internals
     */
    '/api/:path*',
  ],
};
