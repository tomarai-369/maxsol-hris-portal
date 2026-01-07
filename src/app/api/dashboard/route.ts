import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getEmployeeLeaveRequests,
  getEmployeeLeaveBalances,
  getEmployeeDocumentRequests,
  getActiveAnnouncements,
} from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch all data in parallel
    const [leaveRequests, leaveBalances, documentRequests, announcements] = await Promise.all([
      getEmployeeLeaveRequests(user.id),
      getEmployeeLeaveBalances(user.id),
      getEmployeeDocumentRequests(user.id),
      getActiveAnnouncements(),
    ]);

    // Process leave balances
    const leaveBalance = {
      vacation: 0,
      sick: 0,
      emergency: 0,
    };

    leaveBalances.forEach((balance) => {
      const type = balance.leaveType.toLowerCase();
      if (type.includes('vacation') || type.includes('vl')) {
        leaveBalance.vacation = balance.remaining;
      } else if (type.includes('sick') || type.includes('sl')) {
        leaveBalance.sick = balance.remaining;
      } else if (type.includes('emergency') || type.includes('el')) {
        leaveBalance.emergency = balance.remaining;
      }
    });

    // Count pending requests
    const pendingRequests = {
      leave: leaveRequests.filter((r) => r.status === 'Pending').length,
      documents: documentRequests.filter((r) => r.status === 'Pending').length,
    };

    // Format recent leave for dashboard
    const recentLeave = leaveRequests.slice(0, 5).map((r) => ({
      id: r.id,
      type: r.leaveType,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
    }));

    // Format announcements for dashboard
    const formattedAnnouncements = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      priority: a.priority,
      publishDate: a.publishDate,
    }));

    return NextResponse.json({
      leaveBalance,
      pendingRequests,
      recentLeave,
      announcements: formattedAnnouncements,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
