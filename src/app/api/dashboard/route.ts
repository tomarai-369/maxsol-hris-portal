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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const employeeId = user.employeeId;

    // Fetch all data in parallel with individual error handling
    const results = await Promise.allSettled([
      getEmployeeLeaveRequests(employeeId),
      getEmployeeLeaveBalances(employeeId),
      getEmployeeDocumentRequests(employeeId),
      getActiveAnnouncements(),
    ]);

    const leaveRequests = results[0].status === 'fulfilled' ? results[0].value : [];
    const leaveBalances = results[1].status === 'fulfilled' ? results[1].value : [];
    const documentRequests = results[2].status === 'fulfilled' ? results[2].value : [];
    const announcements = results[3].status === 'fulfilled' ? results[3].value : [];

    // Process leave balances
    const leaveBalance = { vacation: 0, sick: 0, emergency: 0 };
    leaveBalances.forEach((balance: any) => {
      const type = (balance.leaveType || '').toLowerCase();
      if (type.includes('vacation') || type.includes('vl')) leaveBalance.vacation = balance.remaining;
      else if (type.includes('sick') || type.includes('sl')) leaveBalance.sick = balance.remaining;
      else if (type.includes('emergency') || type.includes('el')) leaveBalance.emergency = balance.remaining;
    });

    // Count pending
    const pendingRequests = {
      leave: leaveRequests.filter((r: any) => r.status === 'Pending').length,
      documents: documentRequests.filter((r: any) => r.status === 'Pending').length,
    };

    // Recent leave
    const recentLeave = leaveRequests.slice(0, 5).map((r: any) => ({
      id: r.id, type: r.leaveType, startDate: r.startDate, endDate: r.endDate, status: r.status,
    }));

    // Announcements
    const formattedAnnouncements = announcements.map((a: any) => ({
      id: a.id, title: a.title, category: a.category, priority: a.priority, publishDate: a.publishDate,
    }));

    return NextResponse.json({
      leaveBalance,
      pendingRequests,
      recentLeave,
      announcements: formattedAnnouncements,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
