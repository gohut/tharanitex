import { NextResponse } from 'next/server';
import {
  validateSession,
  revokeSessionsForUser,
  buildClearCookieHeader,
} from '../../../../../lib/auth';
import { SESSION_COOKIE_NAME } from '../../../../../types/auth';

/**
 * POST /api/admin/auth/logout-all
 * Log out of all active devices / sessions for current staff user (Part 4)
 */
export async function POST(request) {
  try {
    const sessionToken =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session expired, please log in again.',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userData = await validateSession(sessionToken);

    if (!userData || userData.userType !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Session expired, please log in again.',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Force-revoke all active sessions in D1 database for this admin user
    await revokeSessionsForUser(userData.id, 'admin');

    const response = NextResponse.json({
      success: true,
      message: 'Logged out of all devices successfully.',
    });

    response.headers.append('Set-Cookie', buildClearCookieHeader());
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to logout of all devices.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
