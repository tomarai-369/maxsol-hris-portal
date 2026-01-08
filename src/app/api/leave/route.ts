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
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch leave requests', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Step 1: Get user
  let user;
  try {
    user = await getCurrentUser();
  } catch (e: any) {
    return NextResponse.json({ error: 'Auth error', step: 1, details: e.message }, { status: 500 });
  }
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated', step: 1 }, { status: 401 });
  }

  // Step 2: Parse body
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    return NextResponse.json({ error: 'JSON parse error', step: 2, details: e.message }, { status: 400 });
  }

  const { leaveType, startDate, endDate, totalDays, reason } = body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return NextResponse.json({ error: 'Missing required fields', step: 3, received: body }, { status: 400 });
  }

  // Step 3: Create request
  const employeeName = `${user.lastName}, ${user.firstName}`;
  
  try {
    const result = await createLeaveRequest(user.employeeId, employeeName, {
      leaveType, startDate, endDate, totalDays: totalDays || 1, reason,
    });
    return NextResponse.json({ success: true, id: result.id, message: 'Leave request submitted' });
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'Kintone create error', 
      step: 4,
      details: e.message,
      stack: e.stack?.substring(0, 300),
      employeeId: user.employeeId,
      data: { leaveType, startDate, endDate, totalDays, reason }
    }, { status: 500 });
  }
}
