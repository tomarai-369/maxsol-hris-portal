import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        department: user.department,
        position: user.position,
        employmentStatus: user.employmentStatus,
        dateHired: user.dateHired,
        birthDate: user.birthDate,
        contactNumber: user.contactNumber,
        address: user.address,
        emergencyContact: user.emergencyContact,
        emergencyNumber: user.emergencyNumber,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
