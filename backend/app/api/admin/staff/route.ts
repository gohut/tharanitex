import { NextRequest, NextResponse } from 'next/server';
import {
  enforceAdminPermission,
  hashPassword,
  createNotification,
} from '../../../../lib/auth';
import { CreateStaffRequest, ApiResponse, StaffUser } from '../../../../types/auth';

/**
 * GET /api/admin/staff
 * List all staff accounts with role names (Requires module 'Users & Roles', action 'view')
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
        message: 'Staff list retrieved.',
        data: [],
      });
    }

    const staffList = await db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.status, u.last_login, u.created_at
         FROM staff_users u
         JOIN roles r ON u.role_id = r.id
         ORDER BY u.id ASC`
      )
      .all<StaffUser>();

    return NextResponse.json({
      success: true,
      message: 'Staff accounts retrieved successfully.',
      data: staffList.results || [],
    });
  } catch (err: any) {
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
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const auth = await enforceAdminPermission(request, 'Users & Roles', 'create');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message, error: auth.error },
        { status: auth.status }
      );
    }

    let body: CreateStaffRequest;
    try {
      body = (await request.json()) as CreateStaffRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON format in request body. Keys and string values must use double quotes ("). Example: {"name": "Karthik Raja", "email": "karthik@tharanitex.com", "password": "StaffPassword123!", "role_id": 2, "status": "Active"}',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    if (!body || !body.name || !body.email || !body.password || !body.role_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: name, email, password, and role_id are required.',
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

    // Verify role exists
    const roleExists = await db
      .prepare(`SELECT id FROM roles WHERE id = ?`)
      .bind(body.role_id)
      .first();

    if (!roleExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Role ID ${body.role_id} does not exist.`,
          error: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    const passHash = await hashPassword(body.password);
    const status = body.status === 'Inactive' ? 'Inactive' : 'Active';

    const insertResult = await db
      .prepare(
        `INSERT INTO staff_users (name, email, password_hash, role_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(body.name.trim(), email, passHash, body.role_id, status)
      .run();

    const newStaffId = insertResult.meta.last_row_id;

    // Create Notification (Part 3)
    await createNotification(db, {
      recipient_role: null,
      title: 'Staff Account Created',
      message: `Staff account for ${body.name.trim()} (${email}) was created.`,
      type: 'user',
    });

    const newStaff = await db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.status, u.created_at
         FROM staff_users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = ?`
      )
      .bind(newStaffId)
      .first<StaffUser>();

    return NextResponse.json(
      {
        success: true,
        message: 'Staff account created successfully.',
        data: newStaff,
      },
      { status: 201 }
    );
  } catch (err: any) {
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
