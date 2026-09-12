import { NextResponse } from 'next/server';
import {
  enforceAdminPermission,
  hashPassword,
  createNotification,
  ensureSuperAdminAccount,
} from '../../../../lib/auth';

/**
 * GET /api/admin/staff
 * List all staff accounts with role names (Requires module 'Users & Roles', action 'view')
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
        message: 'Staff list retrieved.',
        data: [],
      });
    }

    await ensureSuperAdminAccount(db, {});

    const staffList = await db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role_id, COALESCE(r.name, CASE WHEN u.role_id = 1 THEN 'Super Admin' WHEN u.role_id = 2 THEN 'Manager' ELSE 'Support Staff' END) as role_name, u.status, u.last_login, u.created_at
         FROM staff_users u
         LEFT JOIN roles r ON u.role_id = r.id
         ORDER BY u.role_id ASC, u.id ASC`
      )
      .all();

    return NextResponse.json({
      success: true,
      message: 'Staff accounts retrieved successfully.',
      data: staffList.results || [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve staff accounts.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/staff
 * Create a new staff account (Requires module 'Users & Roles', action 'create')
 */
export async function POST(request) {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'create');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON format in request body.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    if (!body || !body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: name, email, and password are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: Please provide a valid email address.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: Password must be at least 6 characters long.',
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

    await ensureSuperAdminAccount(db, {});

    // Check email uniqueness
    const existing = await db
      .prepare(`SELECT id FROM staff_users WHERE LOWER(email) = ?`)
      .bind(email)
      .first();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'A staff account with this email address already exists.',
          error: 'DUPLICATE_EMAIL',
        },
        { status: 400 }
      );
    }

    const targetRoleId = parseInt(body.role_id, 10) || 3;

    // Verify role exists or fallback
    let roleRow = await db
      .prepare(`SELECT id, name FROM roles WHERE id = ?`)
      .bind(targetRoleId)
      .first();

    if (!roleRow) {
      await db.prepare(`
        INSERT OR IGNORE INTO roles (id, name) VALUES 
        (1, 'Super Admin'), 
        (2, 'Manager'), 
        (3, 'Support Staff')
      `).run();

      roleRow = await db
        .prepare(`SELECT id, name FROM roles WHERE id = ?`)
        .bind(targetRoleId)
        .first();
    }

    const validRoleId = roleRow ? roleRow.id : 3;
    const roleName = roleRow ? roleRow.name : 'Support Staff';

    const passHash = await hashPassword(body.password.trim());
    const status = body.status === 'Inactive' ? 'Inactive' : 'Active';

    const insertResult = await db
      .prepare(
        `INSERT INTO staff_users (name, email, password_hash, role_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(body.name.trim(), email, passHash, validRoleId, status)
      .run();

    const newStaffId = insertResult.meta?.last_row_id || insertResult.lastRowId;

    // Create Notification
    await createNotification(db, {
      recipient_role: null,
      title: 'Staff Account Created',
      message: `Staff account for ${body.name.trim()} (${email}) was created.`,
      type: 'user',
    }).catch(() => {});

    let newStaff = null;
    if (newStaffId) {
      newStaff = await db
        .prepare(
          `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.status, u.created_at
           FROM staff_users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE u.id = ?`
        )
        .bind(newStaffId)
        .first();
    }

    if (!newStaff) {
      newStaff = {
        id: newStaffId || 999,
        name: body.name.trim(),
        email,
        role_id: validRoleId,
        role_name: roleName,
        status,
        created_at: new Date().toISOString(),
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Staff account created successfully.',
        data: newStaff,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to create staff account.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
