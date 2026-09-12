import { NextResponse } from 'next/server';
import {
  enforceAdminPermission,
  hashPassword,
  revokeSessionsForUser,
  createNotification,
} from '../../../../../lib/auth';

/**
 * PUT /api/admin/staff/:id
 * Update staff account details (Requires module 'Users & Roles', action 'edit')
 */
export async function PUT(request, { params }) {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'edit');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const staffId = parseInt(paramId, 10);
    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid staff ID parameter.', error: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { db } = auth;

    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database service unavailable.', error: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // Fetch existing staff user
    const existing = await db
      .prepare(`SELECT * FROM staff_users WHERE id = ?`)
      .bind(staffId)
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Staff account ID ${staffId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    let passwordChanged = false;
    let roleChanged = false;
    let statusChanged = false;

    let newName = existing.name;
    let newEmail = existing.email;
    let newPassHash = existing.password_hash;
    let newRoleId = existing.role_id;
    let newStatus = existing.status;

    if (body.name && body.name.trim()) {
      newName = body.name.trim();
    }

    if (body.email && body.email.trim()) {
      const trimmedEmail = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email address format.', error: 'BAD_REQUEST' },
          { status: 400 }
        );
      }
      if (trimmedEmail !== existing.email.toLowerCase()) {
        const checkEmail = await db
          .prepare(`SELECT id FROM staff_users WHERE LOWER(email) = ? AND id != ?`)
          .bind(trimmedEmail, staffId)
          .first();
        if (checkEmail) {
          return NextResponse.json(
            {
              success: false,
              message: 'Another staff account is already using this email.',
              error: 'DUPLICATE_EMAIL',
            },
            { status: 400 }
          );
        }
        newEmail = trimmedEmail;
      }
    }

    if (body.password && body.password.trim()) {
      if (body.password.trim().length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: 'Password must be at least 6 characters long.',
            error: 'BAD_REQUEST',
          },
          { status: 400 }
        );
      }
      newPassHash = await hashPassword(body.password.trim());
      passwordChanged = true;
    }

    if (body.role_id && body.role_id !== existing.role_id) {
      const roleExists = await db
        .prepare(`SELECT id FROM roles WHERE id = ?`)
        .bind(body.role_id)
        .first();
      if (!roleExists) {
        return NextResponse.json(
          { success: false, message: `Role ID ${body.role_id} does not exist.`, error: 'INVALID_ROLE' },
          { status: 400 }
        );
      }
      newRoleId = body.role_id;
      roleChanged = true;
    }

    if (body.status && body.status !== existing.status) {
      if (body.status !== 'Active' && body.status !== 'Inactive') {
        return NextResponse.json(
          { success: false, message: "Status must be 'Active' or 'Inactive'.", error: 'BAD_REQUEST' },
          { status: 400 }
        );
      }
      newStatus = body.status;
      statusChanged = true;
    }

    await db
      .prepare(
        `UPDATE staff_users
         SET name = ?, email = ?, password_hash = ?, role_id = ?, status = ?
         WHERE id = ?`
      )
      .bind(newName, newEmail, newPassHash, newRoleId, newStatus, staffId)
      .run();

    // Revoke sessions if sensitive security properties changed
    if (passwordChanged || roleChanged || statusChanged || newStatus === 'Inactive') {
      await revokeSessionsForUser(staffId, 'admin');
    }

    const updatedStaff = await db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role_id, COALESCE(r.name, 'Support Staff') as role_name, u.status, u.last_login, u.created_at
         FROM staff_users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = ?`
      )
      .bind(staffId)
      .first();

    return NextResponse.json({
      success: true,
      message: 'Staff account updated successfully.',
      data: updatedStaff,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to update staff account.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/staff/:id
 * Delete staff account (Requires module 'Users & Roles', action 'delete')
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'delete');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    const { id: paramId } = await params;
    const staffId = parseInt(paramId, 10);
    if (isNaN(staffId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid staff ID parameter.', error: 'BAD_REQUEST' },
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
      .prepare(`SELECT id, name, email, role_id FROM staff_users WHERE id = ?`)
      .bind(staffId)
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Staff account ID ${staffId} not found.`, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Protect Super Admin from deletion
    const isSuperAdminAccount =
      existing.role_id === 1 ||
      ['admin@tharanitextiles.com', 'admin@tharanitex.com'].includes(existing.email?.toLowerCase());

    if (isSuperAdminAccount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Action forbidden: Primary Super Admin account cannot be deleted.',
          error: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Prevent deleting own logged in account
    if (auth.user.id === staffId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Action forbidden: You cannot delete your own logged in staff account.',
          error: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Revoke sessions first
    await revokeSessionsForUser(staffId, 'admin');

    // Delete staff account
    await db.prepare(`DELETE FROM staff_users WHERE id = ?`).bind(staffId).run();

    // Create Notification
    await createNotification(db, {
      recipient_role: null,
      title: 'Staff Account Deleted',
      message: `Staff account ${existing.name} (${existing.email}) was deleted.`,
      type: 'user',
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Staff account ID ${staffId} deleted successfully.`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to delete staff account.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
