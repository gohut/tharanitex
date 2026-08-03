import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getDB } from '../../../../../../lib/auth';
import { SESSION_COOKIE_NAME, ApiResponse } from '../../../../../../types/auth';

/**
 * PUT /api/admin/notifications/:id/read
 * Mark notification as read (Part 3)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
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

    const { id: paramId } = await params;
    const notificationId = parseInt(paramId, 10);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID parameter.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const db = await getDB();

    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const notification = await db
      .prepare(`SELECT id FROM notifications WHERE id = ?`)
      .bind(notificationId)
      .first();

    if (!notification) {
      return NextResponse.json(
        { success: false, message: `Notification ID ${notificationId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await db
      .prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`)
      .bind(notificationId)
      .run();

    return NextResponse.json({
      success: true,
      message: `Notification ID ${notificationId} marked as read.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to update notification.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
