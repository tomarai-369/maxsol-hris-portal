import { NextResponse } from 'next/server';
import { getEmployeeByEmail } from '@/lib/kintone';

export async function GET() {
  const authMethod = process.env.KINTONE_PASS ? 'password' : 'api_token';
  const hasUser = !!process.env.KINTONE_USER;
  const hasPass = !!process.env.KINTONE_PASS;
  
  try {
    // Test a simple query
    const employee = await getEmployeeByEmail('admin@mscorp.com.ph');
    
    return NextResponse.json({
      status: 'success',
      authMethod,
      envVars: {
        KINTONE_USER: hasUser ? 'SET' : 'NOT SET',
        KINTONE_PASS: hasPass ? 'SET' : 'NOT SET',
        KINTONE_DOMAIN: process.env.KINTONE_DOMAIN || 'default'
      },
      employee: employee ? {
        id: employee.id,
        email: employee.email,
        name: `${employee.firstName} ${employee.lastName}`,
        verified: employee.isVerified
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      authMethod,
      envVars: {
        KINTONE_USER: hasUser ? 'SET' : 'NOT SET',
        KINTONE_PASS: hasPass ? 'SET' : 'NOT SET',
        KINTONE_DOMAIN: process.env.KINTONE_DOMAIN || 'default'
      },
      error: error.message
    });
  }
}
