import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTodayDTR } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dtr = await getTodayDTR(user.employeeId);
    
    if (!dtr) {
      return NextResponse.json({
        isClockedIn: false,
        timeIn: null,
        timeOut: null,
      });
    }

    return NextResponse.json({
      isClockedIn: !!dtr.timeIn && !dtr.timeOut,
      timeIn: dtr.timeIn || null,
      timeOut: dtr.timeOut || null,
      recordId: dtr.id,
    });
  } catch (error) {
    console.error('DTR today error:', error);
    return NextResponse.json({ error: 'Failed to fetch DTR' }, { status: 500 });
  }
}
