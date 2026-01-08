import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeBenefits } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const benefits = await getEmployeeBenefits(user.employeeId);

    if (!benefits) {
      return NextResponse.json({
        benefits: null,
        message: 'No benefits record found',
      });
    }

    return NextResponse.json({
      benefits: {
        sssNumber: benefits.sssNumber,
        philhealthNumber: benefits.philhealthNumber,
        pagibigNumber: benefits.pagibigNumber,
        tinNumber: benefits.tinNumber,
        hmoProvider: benefits.hmoProvider,
        hmoPlan: benefits.hmoPlan,
        hmoCardNumber: benefits.hmoCardNumber,
        hmoDependents: benefits.hmoDependents,
        bankName: benefits.bankName,
        bankAccount: benefits.bankAccount,
      },
    });
  } catch (error) {
    console.error('Get benefits error:', error);
    return NextResponse.json({ error: 'Failed to fetch benefits' }, { status: 500 });
  }
}
