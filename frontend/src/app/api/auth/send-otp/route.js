import { NextResponse } from 'next/server';
import { requestOtp } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body || !body.fullName || !body.phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error: fullName and phoneNumber are required.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const result = await requestOtp(body.fullName, body.phoneNumber);

    return NextResponse.json({
      success: true,
      message: `OTP generated and sent successfully to ${result.phoneNumber}.`,
      data: {
        phoneNumber: result.phoneNumber,
        expiresInMinutes: result.expiresInMinutes,
      },
    });
  } catch (err) {
    const isValidationError =
      err.message?.includes('Validation') ||
      err.message?.includes('Invalid') ||
      err.message?.includes('Phone') ||
      err.message?.includes('Full name');

    return NextResponse.json(
      {
        success: false,
        message: err.message || 'An unexpected error occurred while requesting OTP.',
        error: isValidationError ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
