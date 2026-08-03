import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../../lib/auth';
import { ApiResponse } from '../../../../../types/auth';

/**
 * DELETE /api/admin/reviews/:id
 * Hard-delete a review for spam/abuse cleanup (Requires module 'Reviews', action 'delete')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Reviews', 'delete');
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

    const { db } = auth;
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

    await db.prepare(`DELETE FROM reviews WHERE id = ?`).bind(reviewId).run();

    return NextResponse.json({
      success: true,
      message: `Review ID ${reviewId} deleted successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to delete review.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
