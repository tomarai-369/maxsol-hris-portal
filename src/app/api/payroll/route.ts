import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const payrollAppId = process.env.KINTONE_APP_PAYROLL;

    if (!payrollAppId) {
      // Return sample data if not configured
      return NextResponse.json({ records: [] });
    }

    const query = `employee_id = "${user.id}" and pay_period_start like "${year}-%" order by pay_period_start desc`;
    const response = await getRecords(parseInt(payrollAppId), query);

    const records = (response.records || []).map((r: any) => ({
      id: parseInt(r.$id?.value),
      payPeriodStart: r.pay_period_start?.value,
      payPeriodEnd: r.pay_period_end?.value,
      basicPay: parseFloat(r.basic_pay?.value || '0'),
      daysWorked: parseFloat(r.days_worked?.value || '0'),
      overtimePay: parseFloat(r.overtime_pay?.value || '0'),
      holidayPay: parseFloat(r.holiday_pay?.value || '0'),
      nightDiff: parseFloat(r.night_diff?.value || '0'),
      allowances: parseFloat(r.allowances?.value || '0'),
      grossPay: parseFloat(r.gross_pay?.value || '0'),
      sssDeduction: parseFloat(r.sss_deduction?.value || '0'),
      philhealthDeduction: parseFloat(r.philhealth_deduction?.value || '0'),
      pagibigDeduction: parseFloat(r.pagibig_deduction?.value || '0'),
      taxDeduction: parseFloat(r.tax_deduction?.value || '0'),
      loanDeduction: parseFloat(r.loan_deduction?.value || '0'),
      otherDeductions: parseFloat(r.other_deductions?.value || '0'),
      totalDeductions: parseFloat(r.total_deductions?.value || '0'),
      netPay: parseFloat(r.net_pay?.value || '0'),
      status: r.status?.value || 'Posted',
      payDate: r.pay_date?.value,
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Payroll fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}
