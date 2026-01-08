import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeLeaveRequests, createLeaveRequest } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const requests = await getEmployeeLeaveRequests(user.employeeId);
    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id, leaveType: r.leaveType, startDate: r.startDate, endDate: r.endDate,
        totalDays: r.totalDays, reason: r.reason, status: r.status, approver: r.approver,
        approvedDate: r.approvedDate, remarks: r.remarks, createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, totalDays, reason } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Missing required fields', received: body }, { status: 400 });
    }

    const employeeName = `${user.lastName}, ${user.firstName}`;
    
    try {
      const result = await createLeaveRequest(user.employeeId, employeeName, {
        leaveType, startDate, endDate, totalDays: totalDays || 1, reason,
      });
      return NextResponse.json({ success: true, id: result.id, message: 'Leave request submitted' });
    } catch (kintoneError: any) {
      return NextResponse.json({ 
        error: 'Kintone error', 
        details: kintoneError.message,
        user: { employeeId: user.employeeId, name: employeeName },
        data: { leaveType, startDate, endDate, totalDays, reason }
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit request', details: error.message }, { status: 500 });
  }
}
