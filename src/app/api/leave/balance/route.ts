import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeLeaveBalances } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const balances = await getEmployeeLeaveBalances(user.id);

    return NextResponse.json({
      balances: balances.map((b) => ({
        leaveType: b.leaveType,
        totalCredits: b.totalCredits,
        used: b.used,
        remaining: b.remaining,
      })),
    });
  } catch (error) {
    console.error('Get leave balances error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave balances' },
      { status: 500 }
    );
  }
}
