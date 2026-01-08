import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail } from '@/lib/kintone';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const debugInfo: any = {
      step: 'start',
      email,
      hasPassword: !!password
    };
    
    // Step 1: Get employee
    try {
      debugInfo.step = 'getEmployee';
      const employee = await getEmployeeByEmail(email);
      debugInfo.employeeFound = !!employee;
      
      if (employee) {
        debugInfo.employeeId = employee.id;
        debugInfo.isVerified = employee.isVerified;
        debugInfo.hasPasswordHash = !!employee.passwordHash;
        debugInfo.passwordHashLength = employee.passwordHash?.length;
        
        // Step 2: Verify password
        if (employee.passwordHash) {
          debugInfo.step = 'verifyPassword';
          const isValid = await bcrypt.compare(password, employee.passwordHash);
          debugInfo.passwordValid = isValid;
        }
      }
    } catch (e: any) {
      debugInfo.error = e.message;
      debugInfo.stack = e.stack?.substring(0, 500);
    }
    
    return NextResponse.json(debugInfo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) });
  }
}
