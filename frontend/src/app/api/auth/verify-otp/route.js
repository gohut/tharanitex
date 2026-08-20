import { NextResponse } from 'next/server';
import { verifyOtpAndLogin, buildSessionCookieHeader } from '../../../../lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body || !body.fullName || !body.phoneNumber || !body.otp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: fullName, phoneNumber, and otp are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip');

    const { env } = await getCloudflareContext({ async: true });
    const authResult = await verifyOtpAndLogin(
      body.fullName,
      body.phoneNumber,
      body.otp,
      userAgent,
      ipAddress,
      env
    );

    const cookieHeader = buildSessionCookieHeader(authResult.sessionToken);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: authResult.user,
        expiresAt: authResult.expiresAt,
      },
    });

    response.headers.append('Set-Cookie', cookieHeader);
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'OTP verification failed.',
        error: 'AUTH_FAILED',
      },
      { status: 400 }
    );
  }
}

