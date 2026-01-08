import { NextResponse } from 'next/server';
import { getEmployeeByEmail } from '@/lib/kintone';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      KINTONE_DOMAIN: process.env.KINTONE_DOMAIN || 'NOT SET',
      KINTONE_TOKEN_EMPLOYEES: process.env.KINTONE_TOKEN_EMPLOYEES ? 'SET' : 'NOT SET',
      KINTONE_API_TOKEN: process.env.KINTONE_API_TOKEN ? 'SET (length: ' + process.env.KINTONE_API_TOKEN.length + ')' : 'NOT SET',
    };

    // Try to fetch the admin user
    let employeeResult = null;
    let error = null;
    
    try {
      const employee = await getEmployeeByEmail('admin@mscorp.com.ph');
      if (employee) {
        employeeResult = {
          found: true,
          id: employee.id,
          employeeId: employee.employeeId,
          email: employee.email,
          isVerified: employee.isVerified,
          hasPasswordHash: !!employee.passwordHash,
        };
      } else {
        employeeResult = { found: false };
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      status: 'ok',
      env: envCheck,
      employeeResult,
      error,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
