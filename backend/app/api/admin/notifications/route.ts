import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getDB } from '../../../../lib/auth';
import { SESSION_COOKIE_NAME, ApiResponse, NotificationRecord } from '../../../../types/auth';

/**
 * GET /api/admin/notifications
 * List notifications relevant for current user's role or all roles (Part 3)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const db = await getDB();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Notifications retrieved.',
        data: [],
      });
    }

    const roleName = userData.role || userData.roleName || null;

    const query = roleName
      ? `SELECT * FROM notifications
         WHERE recipient_role IS NULL OR recipient_role = ?
         ORDER BY created_at DESC LIMIT 100`
      : `SELECT * FROM notifications
         WHERE recipient_role IS NULL
         ORDER BY created_at DESC LIMIT 100`;

    const stmt = roleName
      ? db.prepare(query).bind(roleName)
      : db.prepare(query);

    const result = await stmt.all<NotificationRecord>();

    return NextResponse.json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: result.results || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve notifications.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
