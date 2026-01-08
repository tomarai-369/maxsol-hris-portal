import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeePayroll } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    const records = await getEmployeePayroll(user.employeeId, year);

    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        basicPay: r.basicPay,
        overtimePay: r.overtimePay,
        holidayPay: r.holidayPay,
        allowances: r.allowances,
        grossPay: r.grossPay,
        sssDeduction: r.sssDeduction,
        philhealthDeduction: r.philhealthDeduction,
        pagibigDeduction: r.pagibigDeduction,
        taxDeduction: r.taxDeduction,
        loanDeduction: r.loanDeduction,
        otherDeductions: r.otherDeductions,
        totalDeductions: r.totalDeductions,
        netPay: r.netPay,
        status: r.status,
        payDate: r.payDate,
      })),
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}
