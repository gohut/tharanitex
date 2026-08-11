import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission } from '../../../../lib/auth';
import { ApiResponse, Role, RolePermission } from '../../../../types/auth';

/**
 * GET /api/admin/roles
 * List all roles and their full permission matrix across all 8 modules (Requires module 'Users & Roles', action 'view')
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    // Fetch all roles
    const rolesResult = await db
      .prepare(`SELECT id, name, created_at FROM roles ORDER BY id ASC`)
      .all<Role>();
    const roles = rolesResult.results || [];

    // Fetch all role permissions
    const permsResult = await db
      .prepare(`SELECT id, role_id, module, can_view, can_create, can_edit, can_delete FROM role_permissions`)
      .all<RolePermission>();
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
  } catch (err: any) {
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


