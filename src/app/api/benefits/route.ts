import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const benefitsAppId = process.env.KINTONE_APP_BENEFITS;

    if (!benefitsAppId) {
      // Return empty benefits if not configured
      return NextResponse.json({
        sssNumber: '',
        philhealthNumber: '',
        pagibigNumber: '',
        tinNumber: '',
        hmoProvider: '',
        hmoPlan: '',
        hmoCardNumber: '',
        hmoDependents: 0,
        lifeInsurancePolicy: '',
        bankName: '',
        bankAccount: '',
      });
    }

    const query = `employee_id = "${user.id}"`;
    const response = await getRecords(parseInt(benefitsAppId), query);

    if (!response.records || response.records.length === 0) {
      return NextResponse.json({
        sssNumber: '',
        philhealthNumber: '',
        pagibigNumber: '',
        tinNumber: '',
        hmoProvider: '',
        hmoPlan: '',
        hmoCardNumber: '',
        hmoDependents: 0,
        lifeInsurancePolicy: '',
        bankName: '',
        bankAccount: '',
      });
    }

    const r = response.records[0];

    return NextResponse.json({
      sssNumber: r.sss_number?.value || '',
      philhealthNumber: r.philhealth_number?.value || '',
      pagibigNumber: r.pagibig_number?.value || '',
      tinNumber: r.tin_number?.value || '',
      hmoProvider: r.hmo_provider?.value || '',
      hmoPlan: r.hmo_plan?.value || '',
      hmoCardNumber: r.hmo_card_number?.value || '',
      hmoDependents: parseInt(r.hmo_dependents?.value || '0'),
      lifeInsurancePolicy: r.life_insurance_policy?.value || '',
      bankName: r.bank_name?.value || '',
      bankAccount: r.bank_account?.value || '',
    });
  } catch (error) {
    console.error('Benefits fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch benefits' }, { status: 500 });
  }
}
