import { NextResponse } from 'next/server';
import { enforceAdminPermission, createNotification } from '../../../../../../lib/auth';

/**
 * PUT /api/admin/reviews/:id/flag
 * Flag a review for administrative concern / abuse (Requires module 'Reviews', action 'edit')
 * Body: { reason?: string }
 * Auto-notifies Super Admin role with type = 'review' (Part 4).
 */
export async function PUT(request, { params }) {
  try {
    const auth = await enforceAdminPermission(request, 'Reviews', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const reviewId = parseInt(paramId, 10);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID parameter.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason ? body.reason.trim() : null;

    const { db, user } = auth;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const existing = await db
      .prepare(`SELECT * FROM reviews WHERE id = ?`)
      .bind(reviewId)
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Review ID ${reviewId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const adminId = typeof user.id === 'number' ? user.id : parseInt(String(user.id), 10) || null;

    await db
      .prepare(
        `UPDATE reviews
         SET status = 'Flagged', flagged_reason = ?, reviewed_by = ?, reviewed_at = datetime('now')
         WHERE id = ?`
      )
      .bind(reason, adminId, reviewId)
      .run();

    // Auto-create notification for Super Admin (Part 4)
    await createNotification(db, {
      recipient_role: 'Super Admin',
      title: 'Review Flagged by Staff',
      message: `Review ID ${reviewId} ("${existing.product_name}") was flagged by ${user.name || 'Admin'}.${
        reason ? ` Reason: ${reason}` : ''
      }`,
      type: 'review',
    });

    const updatedReview = await db
      .prepare(`SELECT * FROM reviews WHERE id = ?`)
      .bind(reviewId)
      .first();

    return NextResponse.json({
      success: true,
      message: `Review ID ${reviewId} has been flagged.`,
      data: updatedReview,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to flag review.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
