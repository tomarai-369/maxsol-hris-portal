import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeLoans } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const loans = await getEmployeeLoans(user.employeeId);

    return NextResponse.json({
      loans: loans.map((l) => ({
        id: l.id,
        loanType: l.loanType,
        principalAmount: l.principalAmount,
        interestRate: l.interestRate,
        totalAmount: l.totalAmount,
        monthlyAmortization: l.monthlyAmortization,
        totalPaid: l.totalPaid,
        balance: l.balance,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status,
      })),
    });
  } catch (error) {
    console.error('Get loans error:', error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}
