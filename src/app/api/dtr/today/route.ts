import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const dtrAppId = process.env.KINTONE_APP_DTR;

    if (!dtrAppId) {
      return NextResponse.json({
        isClockedIn: false,
        isOnLunch: false,
        timeIn: null,
        lunchOut: null,
        lunchIn: null,
      });
    }

    const query = `employee_id = "${user.id}" and date = "${today}"`;
    const response = await getRecords(parseInt(dtrAppId), query);
    
    if (!response.records || response.records.length === 0) {
      return NextResponse.json({
        isClockedIn: false,
        isOnLunch: false,
        timeIn: null,
        lunchOut: null,
        lunchIn: null,
      });
    }

    const record = response.records[0];
    const timeIn = record.time_in?.value;
    const timeOut = record.time_out?.value;
    const lunchOut = record.lunch_out?.value;
    const lunchIn = record.lunch_in?.value;

    return NextResponse.json({
      isClockedIn: !!timeIn && !timeOut,
      isOnLunch: !!lunchOut && !lunchIn,
      timeIn,
      lunchOut,
      lunchIn,
    });
  } catch (error) {
    console.error('DTR today error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
