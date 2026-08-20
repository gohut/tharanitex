import { NextResponse } from 'next/server';
import { getDB } from '../../../../lib/auth';

/**
 * GET /api/public/theme
 * Public unauthenticated endpoint for storefront to fetch live branding colors, logos, and social links.
 */
export async function GET() {
  try {
    const db = await getDB();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Public theme retrieved.',
        data: {},
      });
    }

    const rows = await db
      .prepare(`SELECT key, value FROM store_settings WHERE category = 'branding'`)
      .all();

    const themeMap = {};
    for (const r of rows.results || []) {
      themeMap[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      message: 'Live branding theme retrieved successfully.',
      data: themeMap,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve public theme.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
