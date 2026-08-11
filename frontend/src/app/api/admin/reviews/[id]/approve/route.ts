import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../../../lib/auth';
import { ApiResponse } from '../../../../../../types/auth';
import { Review } from '../../../../../../types/reviews';

/**
 * PUT /api/admin/reviews/:id/approve
 * Approve a review (Requires module 'Reviews', action 'edit')
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
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

    const { db, user } = auth;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const existing = await db
      .prepare(`SELECT id FROM reviews WHERE id = ?`)
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
         SET status = 'Approved', reviewed_by = ?, reviewed_at = datetime('now')
         WHERE id = ?`
      )
      .bind(adminId, reviewId)
      .run();

    const updatedReview = await db
      .prepare(`SELECT * FROM reviews WHERE id = ?`)
      .bind(reviewId)
      .first<Review>();

    return NextResponse.json({
      success: true,
      message: `Review ID ${reviewId} has been approved.`,
      data: updatedReview,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to approve review.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
