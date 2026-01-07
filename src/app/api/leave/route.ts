import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeLeaveRequests, createLeaveRequest } from '@/lib/kintone';

// Get leave requests
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const requests = await getEmployeeLeaveRequests(user.id);

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        totalDays: r.totalDays,
        reason: r.reason,
        status: r.status,
        approver: r.approver,
        remarks: r.remarks,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

// Create leave request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { leaveType, startDate, endDate, totalDays, reason } = await request.json();

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      );
    }

    const employeeName = `${user.firstName} ${user.lastName}`;

    const result = await createLeaveRequest(user.id, employeeName, {
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Leave request submitted successfully',
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit leave request' },
      { status: 500 }
    );
  }
}
