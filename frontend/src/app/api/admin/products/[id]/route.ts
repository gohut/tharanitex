import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../../lib/auth';
import { ApiResponse } from '../../../../../types/auth';
import { Product, UpdateProductRequest } from '../../../../../types/products';

/**
 * PUT /api/admin/products/:id
 * Update product details & published status (Requires module 'Products', action 'edit')
 * Automatically updates updated_at = datetime('now') for instant public sync.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Products', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const productId = parseInt(paramId, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID parameter.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => null)) as UpdateProductRequest;
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.', error: 'BAD_REQUEST' },
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
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(productId)
      .first<Product>();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Product ID ${productId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const name = body.name ? body.name.trim() : existing.name;
    const description = body.description !== undefined ? body.description : existing.description;
    const priceCents = body.price_cents !== undefined ? body.price_cents : existing.price_cents;
    const imageKey = body.image_key !== undefined ? body.image_key : existing.image_key;
    const stock = body.stock !== undefined ? body.stock : existing.stock;
    const isPublished =
      body.is_published !== undefined
        ? body.is_published === true || body.is_published === 1
          ? 1
          : 0
        : existing.is_published;

    await db
      .prepare(
        `UPDATE products
         SET name = ?, description = ?, price_cents = ?, image_key = ?, stock = ?, is_published = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(name, description, priceCents, imageKey, stock, isPublished, productId)
      .run();

    const updatedProduct = await db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(productId)
      .first<Product>();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      data: updatedProduct,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to update product.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/:id
 * Delete product (Requires module 'Products', action 'delete')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Products', 'delete');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const productId = parseInt(paramId, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID parameter.', error: 'BAD_REQUEST' },
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
      .prepare(`SELECT id FROM products WHERE id = ?`)
      .bind(productId)
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Product ID ${productId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.prepare(`DELETE FROM products WHERE id = ?`).bind(productId).run();

    return NextResponse.json({
      success: true,
      message: `Product ID ${productId} deleted successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to delete product.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}


