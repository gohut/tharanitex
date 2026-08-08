import { NextRequest, NextResponse } from 'next/server';
import { enforceAdminPermission, createNotification } from '../../../../../../lib/auth';
import { ApiResponse, ModulePermissionInput, ModuleName } from '../../../../../../types/auth';

const VALID_MODULES: ModuleName[] = [
  'Products',
  'Orders',
  'Customers',
  'Shipping',
  'Reviews',
  'CMS',
  'Users & Roles',
  'Settings',
];

/**
 * PUT /api/admin/roles/:id/permissions
 * Update a role's permission matrix (Requires module 'Users & Roles', action 'edit')
 * Body: Array of { module, can_view, can_create, can_edit, can_delete } or { permissions: [...] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const roleId = parseInt(paramId, 10);
    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID parameter.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const body: any = await request.json();
    const permissionsArray: ModulePermissionInput[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.permissions)
      ? body.permissions
      : [];

    if (permissionsArray.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: An array of module permissions is required.',
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

    // Verify role exists
    const role = await db
      .prepare(`SELECT id, name FROM roles WHERE id = ?`)
      .bind(roleId)
      .first<{ id: number; name: string }>();

    if (!role) {
      return NextResponse.json(
        { success: false, message: `Role ID ${roleId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Process each permission item
    for (const item of permissionsArray) {
      if (!item.module || !VALID_MODULES.includes(item.module)) {
        continue;
      }

      const canView = item.can_view ? 1 : 0;
      const canCreate = item.can_create ? 1 : 0;
      const canEdit = item.can_edit ? 1 : 0;
      const canDelete = item.can_delete ? 1 : 0;

      // Upsert into role_permissions
      const existing = await db
        .prepare(`SELECT id FROM role_permissions WHERE role_id = ? AND module = ?`)
        .bind(roleId, item.module)
        .first();

      if (existing) {
        await db
          .prepare(
            `UPDATE role_permissions
             SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ?
             WHERE role_id = ? AND module = ?`
          )
          .bind(canView, canCreate, canEdit, canDelete, roleId, item.module)
          .run();
      } else {
        await db
          .prepare(
            `INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(roleId, item.module, canView, canCreate, canEdit, canDelete)
          .run();
      }
    }

    // Create notification (Part 3)
    await createNotification(db, {
      recipient_role: null,
      title: 'Role Permissions Updated',
      message: `Permissions updated for role '${role.name}' (ID ${roleId}).`,
      type: 'security',
    });

    // Fetch updated permission matrix
    const updatedPerms = await db
      .prepare(
        `SELECT id, role_id, module, can_view, can_create, can_edit, can_delete
         FROM role_permissions
         WHERE role_id = ?`
      )
      .bind(roleId)
      .all();

    const formattedPerms = (updatedPerms.results || []).map((p: any) => ({
      id: p.id,
      module: p.module,
      can_view: Boolean(p.can_view),
      can_create: Boolean(p.can_create),
      can_edit: Boolean(p.can_edit),
      can_delete: Boolean(p.can_delete),
    }));

    return NextResponse.json({
      success: true,
      message: `Permissions for role '${role.name}' updated successfully.`,
      data: {
        role_id: role.id,
        role_name: role.name,
        permissions: formattedPerms,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to update role permissions.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
