import { NextRequest, NextResponse } from 'next/server';
import { logoutSession, buildClearCookieHeader } from '../../../../lib/auth';
import { SESSION_COOKIE_NAME, ApiResponse } from '../../../../types/auth';


export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const sessionToken =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.headers.get('x-session-token');

    if (sessionToken) {
      await logoutSession(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.headers.append('Set-Cookie', buildClearCookieHeader());
    return response;
  } catch (err: any) {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.headers.append('Set-Cookie', buildClearCookieHeader());
    return response;
  }
}
