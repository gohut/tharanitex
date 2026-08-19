import { NextResponse } from 'next/server';
import { verifyOtpAndLogin, buildSessionCookieHeader } from '../../../../lib/auth';
import { signJWT } from '../../../../utils/jwt';
import { getJwtSecret } from '../../../../utils/jwt-secret';

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

    const authResult = await verifyOtpAndLogin(
      body.fullName,
      body.phoneNumber,
      body.otp,
      userAgent,
      ipAddress
    );

    const cookieHeader = buildSessionCookieHeader(authResult.sessionToken);

    // Also issue JWT for System A compatibility
    let jwtToken = null;
    try {
      const secret = getJwtSecret();
      jwtToken = await signJWT({ id: authResult.user.id, email: `${body.phoneNumber}@customer.tharanitex.com`, role: 'customer' }, secret);
    } catch {
      // JWT fallback optional
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: authResult.user,
        expiresAt: authResult.expiresAt,
        token: jwtToken || authResult.sessionToken,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';
    const secureFlag = isProd ? '; Secure' : '';
    const maxAge = 7 * 24 * 60 * 60;
    const standardOptions = `; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;

    response.headers.append('Set-Cookie', cookieHeader);
    if (jwtToken) {
      response.headers.append('Set-Cookie', `token=${jwtToken}${standardOptions}`);
      response.headers.append('Set-Cookie', `auth_token=${jwtToken}${standardOptions}`);
    }
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

