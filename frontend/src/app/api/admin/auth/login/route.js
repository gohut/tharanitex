import { NextResponse } from 'next/server';
import { adminLogin, buildSessionCookieHeader, buildAdminCookieHeader } from '../../../../../lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * POST /api/admin/auth/login
 * Authenticate staff account via email & password, issue session cookie
 */
export async function POST(request) {
  try {
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

    if (!body || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: email and password are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip');

    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));

    const result = await adminLogin(
      body.email,
      body.password,
      userAgent,
      ipAddress,
      env
    );

    const sessionCookieHeader = buildSessionCookieHeader(result.sessionToken);
    const adminCookieHeader = buildAdminCookieHeader(result.sessionToken);

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful.',
      data: {
        user: result.user,
        expiresAt: result.expiresAt,
      },
    });

    response.headers.append('Set-Cookie', sessionCookieHeader);
    response.headers.append('Set-Cookie', adminCookieHeader);
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Authentication failed.',
        error: 'AUTH_FAILED',
      },
      { status: 400 }
    );
  }
}
