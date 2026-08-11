import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../lib/auth';
import { ApiResponse } from '../../../../types/auth';
import { Review, ReviewStatCounts, ReviewStatus } from '../../../../types/reviews';

/**
 * GET /api/admin/reviews
 * List reviews with status filter, rating filter, search keyword, pagination, and top stat counts.
 * Requires module 'Reviews', action 'view'.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Reviews', 'view');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { db } = auth;
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Reviews retrieved.',
        data: {
          reviews: [],
          total: 0,
          page: 1,
          totalPages: 0,
          statCounts: { pendingCount: 0, approvedCount: 0, flaggedCount: 0, rejectedCount: 0 },
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const ratingParam = searchParams.get('rating');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '8', 10) || 8));
    const offset = (page - 1) * limit;

    // 1. Calculate overall Stat Counts for top cards
    const statsResult = await db
      .prepare(
        `SELECT
           SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
           SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedCount,
           SUM(CASE WHEN status = 'Flagged' THEN 1 ELSE 0 END) as flaggedCount,
           SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount
         FROM reviews`
      )
      .first<{
        pendingCount: number | null;
        approvedCount: number | null;
        flaggedCount: number | null;
        rejectedCount: number | null;
      }>();

    const statCounts: ReviewStatCounts = {
      pendingCount: statsResult?.pendingCount || 0,
      approvedCount: statsResult?.approvedCount || 0,
      flaggedCount: statsResult?.flaggedCount || 0,
      rejectedCount: statsResult?.rejectedCount || 0,
    };

    // 2. Build dynamic filter conditions for review listing
    const whereConditions: string[] = [];
    const bindings: any[] = [];

    if (statusParam && statusParam !== 'All') {
      whereConditions.push('status = ?');
      bindings.push(statusParam);
    }

    if (ratingParam) {
      const parsedRating = parseInt(ratingParam, 10);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        whereConditions.push('rating = ?');
        bindings.push(parsedRating);
      }
    }

    if (searchParam && searchParam.trim()) {
      const term = `%${searchParam.trim().toLowerCase()}%`;
      whereConditions.push(
        '(LOWER(reviewer_name) LIKE ? OR LOWER(product_name) LIKE ? OR LOWER(comment) LIKE ?)'
      );
      bindings.push(term, term, term);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 3. Count total matching reviews
    const countSql = `SELECT COUNT(*) as total FROM reviews ${whereClause}`;
    const countStmt = db.prepare(countSql);
    const boundCountStmt = bindings.length > 0 ? countStmt.bind(...bindings) : countStmt;
    const countResult = await boundCountStmt.first<{ total: number }>();
    const total = countResult?.total || 0;

    // 4. Fetch paginated list
    const listSql = `SELECT * FROM reviews ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const listBindings = [...bindings, limit, offset];
    const listStmt = db.prepare(listSql).bind(...listBindings);
    const listResult = await listStmt.all<Review>();

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      message: 'Reviews retrieved successfully.',
      data: {
        reviews: listResult.results || [],
        total,
        page,
        totalPages,
        statCounts,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve reviews.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}


