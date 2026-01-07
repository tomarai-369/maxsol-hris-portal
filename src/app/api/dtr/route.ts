import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords, KINTONE_APPS } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();

    // Calculate date range for the month
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    const query = `employee_id = "${user.id}" and date >= "${startDate}" and date <= "${endDate}" order by date desc`;

    // Check if DTR app is configured
    const dtrAppId = process.env.KINTONE_APP_DTR;
    if (!dtrAppId) {
      // Return sample data if not configured
      return NextResponse.json({ records: [] });
    }

    const response = await getRecords(parseInt(dtrAppId), query);
    
    const records = (response.records || []).map((r: any) => ({
      id: parseInt(r.$id?.value),
      date: r.date?.value,
      timeIn: r.time_in?.value,
      timeOut: r.time_out?.value,
      lunchOut: r.lunch_out?.value,
      lunchIn: r.lunch_in?.value,
      totalHours: parseFloat(r.total_hours?.value || '0'),
      overtimeHours: parseFloat(r.overtime_hours?.value || '0'),
      lateMinutes: parseInt(r.late_minutes?.value || '0'),
      undertimeMinutes: parseInt(r.undertime_minutes?.value || '0'),
      status: r.status?.value || 'Present',
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error('DTR fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch DTR' }, { status: 500 });
  }
}
