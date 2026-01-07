import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail, updateEmployeePassword } from '@/lib/kintone';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Step 1: Check if email exists and return employee info
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
        { error: 'Email not found in our records. Please contact HR to register.' },
        { status: 404 }
      );
    }

    // If already has password, redirect to login
    if (employee.passwordHash) {
      return NextResponse.json(
        { 
          error: 'Account already activated. Please login with your password.',
          alreadyActivated: true 
        },
        { status: 400 }
      );
    }

    // Return employee info for password setup
    return NextResponse.json({
      success: true,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        employeeId: employee.employeeId,
      },
    });
  } catch (error) {
    console.error('Activation check error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Step 2: Set password and activate account
export async function PUT(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if already has password
    if (employee.passwordHash) {
      return NextResponse.json(
        { error: 'Account already activated. Please login.' },
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      user: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
      },
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
