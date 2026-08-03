import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/auth';
import { ApiResponse } from '../../../../types/auth';
import { Product } from '../../../../types/products';

/**
 * GET /api/public/products
 * Public unauthenticated storefront route fetching published products live from Cloudflare D1.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const db = await getDB();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Public products retrieved.',
        data: [],
      });
    }

    const products = await db
      .prepare(`SELECT * FROM products WHERE is_published = 1 ORDER BY updated_at DESC, id DESC`)
      .all<Product>();

    return NextResponse.json({
      success: true,
      message: 'Published products retrieved successfully.',
      data: products.results || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve public products.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
