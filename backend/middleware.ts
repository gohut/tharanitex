import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from './types/auth';
import { validateSession } from './lib/auth';

// Paths that do not require authentication
const PUBLIC_PATHS = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/admin/auth/login',
];

// Protected route prefixes
const PROTECTED_PREFIXES = [
  '/api/admin',
  '/api/cart',
  '/api/orders',
  '/api/user',
  '/api/auth/session',
];

export async function middleware(request: NextRequest) {
  let { pathname } = request.nextUrl;
  pathname = pathname.replace(/\/+/g, '/');
  const originalPathname = pathname;

  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Skip public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    if (originalPathname.endsWith('/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Check if current path requires authentication check
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = sessionCookie?.value || request.headers.get('x-session-token');

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Session expired, please log in again.',
        error: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // Validate session against D1 (and KV cache fallback)
  const userData = await validateSession(token);

  if (!userData) {
    return NextResponse.json(
      {
        success: false,
        message: 'Session expired, please log in again.',
        error: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // Clone request headers and attach session token & user info for API route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-token', token);
  requestHeaders.set('x-user-id', String(userData.id));
  requestHeaders.set('x-user-type', userData.userType);

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
