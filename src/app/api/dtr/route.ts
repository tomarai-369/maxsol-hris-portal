import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeDTR } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format

    const records = await getEmployeeDTR(user.employeeId, month || undefined);

    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        date: r.date,
        timeIn: r.timeIn,
        timeOut: r.timeOut,
        lunchOut: r.lunchOut,
        lunchIn: r.lunchIn,
        totalHours: r.totalHours,
        overtimeHours: r.overtimeHours,
        lateMinutes: r.lateMinutes,
        status: r.status,
        remarks: r.remarks,
      })),
    });
  } catch (error) {
    console.error('Get DTR error:', error);
    return NextResponse.json({ error: 'Failed to fetch DTR' }, { status: 500 });
  }
}
