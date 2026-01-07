import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords, addRecord, updateRecord } from '@/lib/kintone';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, location } = await request.json();
    const dtrAppId = process.env.KINTONE_APP_DTR;

    if (!dtrAppId) {
      return NextResponse.json({ error: 'DTR not configured' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Check for existing record today
    const query = `employee_id = "${user.id}" and date = "${today}"`;
    const existing = await getRecords(parseInt(dtrAppId), query);

    if (action === 'in') {
      if (existing.records && existing.records.length > 0) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
      }

      // Create new DTR record
      await addRecord(parseInt(dtrAppId), {
        employee_id: { value: user.id.toString() },
        employee_name: { value: `${user.firstName} ${user.lastName}` },
        date: { value: today },
        time_in: { value: now },
        status: { value: 'Present' },
        remarks: { value: location ? `Location: ${location}` : '' },
      });

      return NextResponse.json({ success: true, action: 'in', time: now });
    }

    // For other actions, we need an existing record
    if (!existing.records || existing.records.length === 0) {
      return NextResponse.json({ error: 'No clock-in record found' }, { status: 400 });
    }

    const record = existing.records[0];
    const recordId = record.$id.value;
    const revision = record.$revision.value;

    const updateData: Record<string, any> = {};

    switch (action) {
      case 'out':
        updateData.time_out = { value: now };
        // Calculate total hours
        const timeIn = record.time_in?.value;
        if (timeIn) {
          const inTime = new Date(`2000-01-01 ${timeIn}`);
          const outTime = new Date(`2000-01-01 ${now}`);
          let hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
          
          // Subtract lunch time if applicable
          const lunchOut = record.lunch_out?.value;
          const lunchIn = record.lunch_in?.value;
          if (lunchOut && lunchIn) {
            const lunchStart = new Date(`2000-01-01 ${lunchOut}`);
            const lunchEnd = new Date(`2000-01-01 ${lunchIn}`);
            hours -= (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60 * 60);
          }
          
          updateData.total_hours = { value: Math.max(0, hours).toFixed(2) };
          
          // Calculate overtime (assuming 8-hour workday)
          const overtime = Math.max(0, hours - 8);
          updateData.overtime_hours = { value: overtime.toFixed(2) };
        }
        break;

      case 'lunch_out':
        updateData.lunch_out = { value: now };
        break;

      case 'lunch_in':
        updateData.lunch_in = { value: now };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await updateRecord(parseInt(dtrAppId), recordId, updateData, revision);

    return NextResponse.json({ success: true, action, time: now });
  } catch (error) {
    console.error('Clock action error:', error);
    return NextResponse.json({ error: 'Failed to process clock action' }, { status: 500 });
  }
}
