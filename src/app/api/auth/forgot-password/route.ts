import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail, setVerificationToken } from '@/lib/kintone';
import { generateVerificationToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const employee = await getEmployeeByEmail(email.toLowerCase().trim());

    // Always return success to prevent email enumeration
    if (!employee || !employee.isVerified) {
      return NextResponse.json({
        success: true,
        message: 'If your email exists in our system, you will receive a reset link',
      });
    }

    // Generate and save reset token
    const token = generateVerificationToken();
    await setVerificationToken(employee.id, token);

    // Send reset email
    await sendPasswordResetEmail(employee.email, employee.firstName, token);

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
