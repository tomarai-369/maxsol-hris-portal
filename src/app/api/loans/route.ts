import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const loansAppId = process.env.KINTONE_APP_LOANS;

    if (!loansAppId) {
      // Return empty if not configured
      return NextResponse.json({ records: [] });
    }

    const query = `employee_id = "${user.id}" order by start_date desc`;
    const response = await getRecords(parseInt(loansAppId), query);

    const records = (response.records || []).map((r: any) => ({
      id: parseInt(r.$id?.value),
      loanType: r.loan_type?.value || '',
      principalAmount: parseFloat(r.principal_amount?.value || '0'),
      interestRate: parseFloat(r.interest_rate?.value || '0'),
      totalAmount: parseFloat(r.total_amount?.value || '0'),
      monthlyAmortization: parseFloat(r.monthly_amortization?.value || '0'),
      totalPaid: parseFloat(r.total_paid?.value || '0'),
      balance: parseFloat(r.balance?.value || '0'),
      startDate: r.start_date?.value || '',
      endDate: r.end_date?.value || '',
      status: r.status?.value || 'Active',
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Loans fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}
