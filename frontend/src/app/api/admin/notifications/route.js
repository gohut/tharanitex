import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/auth';
import { authenticateAdmin } from '../../../../middleware/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * GET /api/admin/notifications
 * List notifications relevant for current user's role or all roles (Part 3)
 */
export async function GET(request) {
  try {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));
    const userData = await authenticateAdmin(request, env);

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

    const db = await getDB(env);

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

    const result = await stmt.all();

    return NextResponse.json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: result.results || [],
    });
  } catch (err) {
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
