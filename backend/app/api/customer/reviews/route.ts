import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getDB, createNotification } from '../../../../lib/auth';
import { SESSION_COOKIE_NAME, ApiResponse } from '../../../../types/auth';
import { CreateReviewRequest, Review } from '../../../../types/reviews';

/**
 * POST /api/customer/reviews
 * Customer-facing route to submit a product review.
 * Always creates review with status = 'Pending'.
 * Enforces 1 review per customer per product rate limit.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    const body = (await request.json().catch(() => null)) as CreateReviewRequest;

    if (!body || !body.product_id || !body.rating || !body.comment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: product_id, rating (1-5), and comment are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const productId = parseInt(String(body.product_id), 10);
    const rating = parseInt(String(body.rating), 10);
    const comment = body.comment.trim();

    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid product_id format.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be an integer between 1 and 5.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: 'Review comment must be at least 3 characters long.',
          error: 'BAD_REQUEST',
        },
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

    const customerIdNum =
      typeof userData.id === 'number'
        ? userData.id
        : parseInt(String(userData.id).replace(/\D/g, ''), 10) || 100;

    const reviewerName = userData.fullName || userData.name || 'Verified Customer';

    // Rate-limit check: one review per customer per product
    const existingReview = await db
      .prepare(`SELECT id FROM reviews WHERE customer_id = ? AND product_id = ?`)
      .bind(customerIdNum, productId)
      .first();

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already submitted a review for this product.',
          error: 'DUPLICATE_REVIEW',
        },
        { status: 400 }
      );
    }

    // Resolve product name if provided or fallback
    let productName = body.product_name ? body.product_name.trim() : '';
    if (!productName) {
      try {
        const prod = await db
          .prepare(`SELECT name FROM products WHERE id = ?`)
          .bind(productId)
          .first<{ name: string }>();
        if (prod && prod.name) {
          productName = prod.name;
        }
      } catch {
        // Products table lookup optional fallback
      }
    }
    if (!productName) {
      productName = `Product #${productId}`;
    }

    const insertResult = await db
      .prepare(
        `INSERT INTO reviews (reviewer_name, customer_id, product_id, product_name, rating, comment, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending', datetime('now'))`
      )
      .bind(reviewerName, customerIdNum, productId, productName, rating, comment)
      .run();

    const newReviewId = insertResult.meta.last_row_id;

    // Auto-create notification for admin team (Part 4)
    await createNotification(db, {
      recipient_role: null, // notify all admins
      title: 'New Product Review Submitted',
      message: `A new ${rating}-star review for "${productName}" by ${reviewerName} is pending approval.`,
      type: 'review',
    });

    const newReview = await db
      .prepare(`SELECT * FROM reviews WHERE id = ?`)
      .bind(newReviewId)
      .first<Review>();

    return NextResponse.json(
      {
        success: true,
        message: 'Your review has been submitted and is pending admin approval. Thank you!',
        data: newReview,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to submit review.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
