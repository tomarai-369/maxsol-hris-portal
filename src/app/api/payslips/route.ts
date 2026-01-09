import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeePayroll } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payslips = await getEmployeePayroll(user.employeeId);
    return NextResponse.json({ payslips });
  } catch (error) {
    console.error('Payslips error:', error);
    return NextResponse.json({ error: 'Failed to fetch payslips' }, { status: 500 });
  }
}
