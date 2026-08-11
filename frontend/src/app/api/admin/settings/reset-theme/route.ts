import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../../lib/auth';
import { ApiResponse } from '../../../../../types/auth';

const DEFAULT_THEME_COLORS: Record<string, string> = {
  primary_background: '#0F172A',
  secondary_background: '#1E293B',
  surface_color: '#1E293B',
  hover_surface: '#334155',
  page_background: '#090D16',
  elevated_background: '#1E293B',
  major_text_color: '#F8FAFC',
  minor_text_color: '#94A3B8',
  soft_text_color: '#CBD5E1',
  muted_text_color: '#64748B',
  accent_color: '#D97706',
  accent_hover_color: '#B45309',
  accent_text_color: '#FFFFFF',
  success_color: '#10B981',
  info_color: '#3B82F6',
  warning_color: '#F59E0B',
  danger_color: '#EF4444',
  purple_status_color: '#8B5CF6',
  orange_status_color: '#F97316',
  neutral_status_color: '#64748B',
};

/**
 * POST /api/admin/settings/reset-theme
 * Revert all 22 branding theme colors to last saved values from settings_audit_log or defaults.
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

    const { db, user } = auth;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    const adminId = typeof user.id === 'number' ? user.id : parseInt(String(user.id), 10) || null;

    // Reset each theme color key
    for (const [key, defaultVal] of Object.entries(DEFAULT_THEME_COLORS)) {
      // Find current value
      const current = await db
        .prepare(`SELECT value FROM store_settings WHERE category = 'branding' AND key = ?`)
        .bind(key)
        .first<{ value: string | null }>();

      const currentValue = current ? current.value : null;

      // Find last saved value in audit log prior to current value, or fallback to default
      const lastAudit = await db
        .prepare(
          `SELECT old_value FROM settings_audit_log
           WHERE category = 'branding' AND key = ? AND old_value IS NOT NULL AND old_value != ''
           ORDER BY changed_at DESC LIMIT 1`
        )
        .bind(key)
        .first<{ old_value: string }>();

      const targetValue = lastAudit?.old_value || defaultVal;

      if (currentValue !== targetValue) {
        await db
          .prepare(
            `INSERT INTO store_settings (category, key, value, updated_by, updated_at)
             VALUES ('branding', ?, ?, ?, datetime('now'))
             ON CONFLICT(category, key) DO UPDATE SET
               value = excluded.value,
               updated_by = excluded.updated_by,
               updated_at = datetime('now')`
          )
          .bind(key, targetValue, adminId)
          .run();

        await db
          .prepare(
            `INSERT INTO settings_audit_log (category, key, old_value, new_value, changed_by, changed_at)
             VALUES ('branding', ?, ?, ?, ?, datetime('now'))`
          )
          .bind(key, currentValue, targetValue, adminId)
          .run();
      }
    }

    // Fetch updated branding settings map
    const rows = await db
      .prepare(`SELECT key, value FROM store_settings WHERE category = 'branding'`)
      .all<{ key: string; value: string | null }>();

    const updatedBranding: Record<string, string | null> = {};
    for (const r of rows.results || []) {
      updatedBranding[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      message: 'Branding theme colors reset successfully.',
      data: updatedBranding,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to reset theme colors.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}


