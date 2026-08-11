import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/auth';
import { ApiResponse } from '../../../../../types/auth';
import { Product } from '../../../../../types/products';

/**
 * GET /api/public/products/:id
 * Public unauthenticated storefront route fetching a single published product details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id: paramId } = await params;
    const productId = parseInt(paramId, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID parameter.', error: 'BAD_REQUEST' },
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

    const product = await db
      .prepare(`SELECT * FROM products WHERE id = ? AND is_published = 1`)
      .bind(productId)
      .first<Product>();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: `Product ID ${productId} not found or not published.`,
          error: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product retrieved successfully.',
      data: product,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve product.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
