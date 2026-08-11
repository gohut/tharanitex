import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '../../../../lib/auth';
import { SESSION_COOKIE_NAME, ApiResponse } from '../../../../types/auth';


export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const sessionToken =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active session found.',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userData = await validateSession(sessionToken);

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session has expired or is invalid.',
          error: 'INVALID_SESSION',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Active session retrieved successfully.',
      data: {
        user: userData,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred during session verification.',
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
