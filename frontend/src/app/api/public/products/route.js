import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/auth';

/**
 * GET /api/public/products
 * Public unauthenticated storefront route fetching published products live from Cloudflare D1.
 */
export async function GET() {
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
      .all();

    return NextResponse.json({
      success: true,
      message: 'Published products retrieved successfully.',
      data: products.results || [],
    });
  } catch (err) {
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
