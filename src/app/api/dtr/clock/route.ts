import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTodayDTR, clockIn, clockOut } from '@/lib/kintone';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, location } = await request.json();
    const fullName = `${user.lastName}, ${user.firstName}`;

    if (action === 'in') {
      // Check if already clocked in today
      const existing = await getTodayDTR(user.employeeId);
      if (existing && existing.timeIn) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
      }
      
      await clockIn(user.employeeId, fullName, location);
      return NextResponse.json({ success: true, message: 'Clocked in successfully' });
    } else if (action === 'out') {
      const dtr = await getTodayDTR(user.employeeId);
      if (!dtr || !dtr.timeIn) {
        return NextResponse.json({ error: 'Not clocked in today' }, { status: 400 });
      }
      if (dtr.timeOut) {
        return NextResponse.json({ error: 'Already clocked out today' }, { status: 400 });
      }
      
      await clockOut(dtr.id);
      return NextResponse.json({ success: true, message: 'Clocked out successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Clock error:', error);
    return NextResponse.json({ error: 'Failed to process clock action' }, { status: 500 });
  }
}
