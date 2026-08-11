import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../lib/auth';
import { ApiResponse } from '../../../../types/auth';
import { Product, CreateProductRequest } from '../../../../types/products';

/**
 * GET /api/admin/products
 * List all products for admin management (both published and draft).
 * Requires module 'Products', action 'view'.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Products', 'view');
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
        message: 'Products retrieved.',
        data: [],
      });
    }

    const products = await db
      .prepare(`SELECT * FROM products ORDER BY updated_at DESC, id DESC`)
      .all<Product>();

    return NextResponse.json({
      success: true,
      message: 'Admin products retrieved successfully.',
      data: products.results || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve products.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product (Requires module 'Products', action 'create')
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Products', 'create');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const body = (await request.json().catch(() => null)) as CreateProductRequest;

    if (!body || !body.name || body.price_cents === undefined || body.price_cents < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: name and positive price_cents are required.',
          error: 'BAD_REQUEST',
        },
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

    const isPublished = body.is_published === false || body.is_published === 0 ? 0 : 1;
    const stock = body.stock !== undefined ? Math.max(0, parseInt(String(body.stock), 10) || 0) : 0;
    const desc = body.description ? body.description.trim() : null;
    const imgKey = body.image_key ? body.image_key.trim() : null;

    const result = await db
      .prepare(
        `INSERT INTO products (name, description, price_cents, image_key, stock, is_published, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(body.name.trim(), desc, body.price_cents, imgKey, stock, isPublished)
      .run();

    const newProductId = result.meta.last_row_id;

    const newProduct = await db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(newProductId)
      .first<Product>();

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully.',
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to create product.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}


