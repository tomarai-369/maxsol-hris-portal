import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'not set';
  const KINTONE_TOKEN_EMPLOYEES = process.env.KINTONE_TOKEN_EMPLOYEES || 'not set';
  
  // Test Kintone connection
  let kintoneTest = 'not tested';
  try {
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303&query=email%3D%22admin%40mscorp.com.ph%22`;
    const response = await fetch(url, {
      headers: {
        'X-Cybozu-API-Token': KINTONE_TOKEN_EMPLOYEES,
      },
    });
    const data = await response.json();
    if (data.records && data.records.length > 0) {
      kintoneTest = `Found ${data.records.length} record(s)`;
    } else if (data.message) {
      kintoneTest = `Error: ${data.message}`;
    } else {
      kintoneTest = 'No records found';
    }
  } catch (error: any) {
    kintoneTest = `Exception: ${error.message}`;
  }

  return NextResponse.json({
    env: {
      KINTONE_DOMAIN: KINTONE_DOMAIN.substring(0, 10) + '...',
      KINTONE_TOKEN_EMPLOYEES: KINTONE_TOKEN_EMPLOYEES ? KINTONE_TOKEN_EMPLOYEES.substring(0, 10) + '...' : 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    },
    kintoneTest,
  });
}
