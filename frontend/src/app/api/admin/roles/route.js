import { NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../lib/auth';

async function ensureRolesTables(db) {
  if (!db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL REFERENCES roles(id),
        module TEXT NOT NULL,
        can_view INTEGER DEFAULT 0,
        can_create INTEGER DEFAULT 0,
        can_edit INTEGER DEFAULT 0,
        can_delete INTEGER DEFAULT 0,
        UNIQUE(role_id, module)
      )
    `).run();

    await db.prepare(`
      INSERT OR IGNORE INTO roles (id, name) VALUES 
      (1, 'Super Admin'), 
      (2, 'Manager'), 
      (3, 'Support Staff')
    `).run();
  } catch {
    // Non-blocking
  }
}

/**
 * GET /api/admin/roles
 * List all roles and their full permission matrix across all modules (Requires module 'Users & Roles', action 'view')
 */
export async function GET(request) {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'view');
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
        message: 'Roles retrieved successfully.',
        data: [],
      });
    }

    await ensureRolesTables(db);

    // Fetch all roles
    const rolesResult = await db
      .prepare(`SELECT id, name, created_at FROM roles ORDER BY id ASC`)
      .all();
    const roles = rolesResult.results || [];

    // Fetch all role permissions
    const permsResult = await db
      .prepare(`SELECT id, role_id, module, can_view, can_create, can_edit, can_delete FROM role_permissions`)
      .all();
    const allPermissions = permsResult.results || [];

    // Group permissions by role_id
    const rolesWithPermissions = roles.map((role) => {
      const perms = allPermissions
        .filter((p) => p.role_id === role.id)
        .map((p) => ({
          id: p.id,
          module: p.module,
          can_view: Boolean(p.can_view),
          can_create: Boolean(p.can_create),
          can_edit: Boolean(p.can_edit),
          can_delete: Boolean(p.can_delete),
        }));

      return {
        id: role.id,
        name: role.name,
        created_at: role.created_at,
        permissions: perms,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Roles and permission matrix retrieved successfully.',
      data: rolesWithPermissions,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve roles and permissions.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
