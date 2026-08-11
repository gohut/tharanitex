import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../../lib/auth';
import { ApiResponse } from '../../../../../types/auth';

/**
 * POST /api/admin/settings/logo
 * Multipart form upload for Store Logo / Favicon.
 * Stores in Cloudflare R2 bucket (binding IMAGES), updates store_settings, and logs audit record.
 * Requires module 'Settings', action 'edit'.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Settings', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: Multipart form data with image file is required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const file = (formData.get('file') || formData.get('logo')) as File | null;
    const keyName = (formData.get('target') as string) === 'favicon' ? 'favicon_url' : 'logo_url';

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error: No file uploaded. Please include 'file' or 'logo' field.",
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: 'File size exceeds 5MB limit.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const r2Key = `branding/${keyName === 'favicon_url' ? 'favicon' : 'logo'}-${timestamp}-${fileName}`;
    const contentType = file.type || 'image/png';

    let logoUrl = `/images/${r2Key}`;

    // R2 Bucket storage execution
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = await getCloudflareContext();
      const imagesBucket = (ctx?.env as unknown as { tharani_product_images?: R2Bucket })?.tharani_product_images;

      if (imagesBucket) {
        await imagesBucket.put(r2Key, arrayBuffer, {
          httpMetadata: { contentType },
        });
        logoUrl = `/api/public/images/${r2Key}`;
      }
    } catch {
      // Fallback for dev environment without R2 binding
      logoUrl = `/uploads/${r2Key}`;
    }

    const { db, user } = auth;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const adminId = typeof user.id === 'number' ? user.id : parseInt(String(user.id), 10) || null;

    // Get previous value for audit logging
    const existing = await db
      .prepare(`SELECT value FROM store_settings WHERE category = 'branding' AND key = ?`)
      .bind(keyName)
      .first<{ value: string | null }>();

    const oldValue = existing ? existing.value : null;

    // Upsert setting
    await db
      .prepare(
        `INSERT INTO store_settings (category, key, value, updated_by, updated_at)
         VALUES ('branding', ?, ?, ?, datetime('now'))
         ON CONFLICT(category, key) DO UPDATE SET
           value = excluded.value,
           updated_by = excluded.updated_by,
           updated_at = datetime('now')`
      )
      .bind(keyName, logoUrl, adminId)
      .run();

    // Write Audit Log
    await db
      .prepare(
        `INSERT INTO settings_audit_log (category, key, old_value, new_value, changed_by, changed_at)
         VALUES ('branding', ?, ?, ?, ?, datetime('now'))`
      )
      .bind(keyName, oldValue, logoUrl, adminId)
      .run();

    return NextResponse.json({
      success: true,
      message: `${keyName === 'favicon_url' ? 'Favicon' : 'Logo'} uploaded successfully.`,
      data: {
        key: keyName,
        logo_url: logoUrl,
        r2_key: r2Key,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to upload image.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}






