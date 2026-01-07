import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail, setVerificationToken, updateEmployeePassword } from '@/lib/kintone';
import { hashPassword, generateVerificationToken, generateToken } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';
import { cookies } from 'next/headers';

// Request activation link
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

    if (!employee) {
      return NextResponse.json(
        { error: 'Email not found in our records. Please contact HR.' },
        { status: 404 }
      );
    }

    if (employee.isVerified && employee.passwordHash) {
      return NextResponse.json(
        { error: 'Account is already activated. Please login.' },
        { status: 400 }
      );
    }

    // Generate and save verification token
    const token = generateVerificationToken();
    await setVerificationToken(employee.id, token);

    // Send activation email
    const emailSent = await sendActivationEmail(employee.email, employee.firstName, token);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send activation email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activation link sent to your email',
    });
  } catch (error) {
    console.error('Activation request error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Complete activation (set password)
export async function PUT(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const employee = await getEmployeeByEmail(email.toLowerCase().trim());

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid activation link' },
        { status: 400 }
      );
    }

    if (employee.verificationToken !== token) {
      return NextResponse.json(
        { error: 'Invalid or expired activation link' },
        { status: 400 }
      );
    }

    // Hash password and update employee
    const passwordHash = await hashPassword(password);
    await updateEmployeePassword(employee.id, passwordHash);

    // Generate auth token and set cookie
    const authToken = generateToken({
      employeeId: employee.id,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
    });
  } catch (error) {
    console.error('Activation completion error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
