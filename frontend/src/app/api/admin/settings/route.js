import { NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../lib/auth';

const VALID_CATEGORIES = ['general', 'contact', 'branding'];

const COLOR_KEYS = [
  'primary_background',
  'secondary_background',
  'surface_color',
  'hover_surface',
  'page_background',
  'elevated_background',
  'major_text_color',
  'minor_text_color',
  'soft_text_color',
  'muted_text_color',
  'accent_color',
  'accent_hover_color',
  'accent_text_color',
  'success_color',
  'info_color',
  'warning_color',
  'danger_color',
  'purple_status_color',
  'orange_status_color',
  'neutral_status_color',
];

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/admin/settings?category=general|contact|branding
 * Retrieve key-value settings map for a specific category.
 * Requires module 'Settings', action 'view'.
 */
export async function GET(request) {
  try {
    const auth = await enforceAdminPermission(request, 'Settings', 'view');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = (searchParams.get('category') || 'general').toLowerCase();

    if (!VALID_CATEGORIES.includes(categoryParam)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid category parameter. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const { db } = auth;
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Settings retrieved.',
        data: {},
      });
    }

    const rows = await db
      .prepare(`SELECT key, value FROM store_settings WHERE category = ?`)
      .bind(categoryParam)
      .all();

    const settingsMap = {};
    for (const r of rows.results || []) {
      settingsMap[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      message: `Settings for category '${categoryParam}' retrieved successfully.`,
      data: settingsMap,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve store settings.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Upsert category settings and log audit records for every changed key.
 * Requires module 'Settings', action 'edit'.
 */
export async function PUT(request) {
  try {
    const auth = await enforceAdminPermission(request, 'Settings', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || !body.category || !body.values || typeof body.values !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: category and values object are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const category = body.category.toLowerCase();

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid category parameter. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    // Input Validations
    for (const [key, val] of Object.entries(body.values)) {
      if (val === null || val === undefined) continue;

      const strVal = String(val).trim();

      if (COLOR_KEYS.includes(key) && strVal) {
        if (!HEX_COLOR_REGEX.test(strVal)) {
          return NextResponse.json(
            {
              success: false,
              message: `Validation error: Key '${key}' must be a valid hex color code (e.g. #0F172A). Received: '${strVal}'`,
              error: 'BAD_REQUEST',
            },
            { status: 400 }
          );
        }
      }

      if ((key === 'admin_email' || key === 'support_email') && strVal) {
        if (!EMAIL_REGEX.test(strVal)) {
          return NextResponse.json(
            {
              success: false,
              message: `Validation error: Key '${key}' must be a valid email address. Received: '${strVal}'`,
              error: 'BAD_REQUEST',
            },
            { status: 400 }
          );
        }
      }
    }

    const { db, user } = auth;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const adminId = typeof user.id === 'number' ? user.id : parseInt(String(user.id), 10) || null;

    // Process each key-value change
    for (const [key, rawVal] of Object.entries(body.values)) {
      const val = rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : null;

      // Query current value
      const existing = await db
        .prepare(`SELECT value FROM store_settings WHERE category = ? AND key = ?`)
        .bind(category, key)
        .first();

      const oldValue = existing ? existing.value : null;

      if (oldValue !== val) {
        // Upsert setting
        await db
          .prepare(
            `INSERT INTO store_settings (category, key, value, updated_by, updated_at)
             VALUES (?, ?, ?, ?, datetime('now'))
             ON CONFLICT(category, key) DO UPDATE SET
               value = excluded.value,
               updated_by = excluded.updated_by,
               updated_at = datetime('now')`
          )
          .bind(category, key, val, adminId)
          .run();

        // Write Audit Log
        await db
          .prepare(
            `INSERT INTO settings_audit_log (category, key, old_value, new_value, changed_by, changed_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(category, key, oldValue, val, adminId)
          .run();
      }
    }

    // Fetch updated category settings map
    const rows = await db
      .prepare(`SELECT key, value FROM store_settings WHERE category = ?`)
      .bind(category)
      .all();

    const updatedMap = {};
    for (const r of rows.results || []) {
      updatedMap[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      message: `Settings for '${category}' updated successfully.`,
      data: updatedMap,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to update settings.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
