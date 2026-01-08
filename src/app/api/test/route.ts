import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_TOKEN_EMPLOYEES = process.env.KINTONE_TOKEN_EMPLOYEES || process.env.KINTONE_API_TOKEN || '';

export async function GET() {
  try {
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
    
    // NO Content-Type for GET requests!
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_TOKEN_EMPLOYEES,
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      tokenPreview: KINTONE_TOKEN_EMPLOYEES ? KINTONE_TOKEN_EMPLOYEES.substring(0, 10) + '...' : 'EMPTY',
      recordCount: data.records?.length || 0,
      error: data.message || data.code || null
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'exception', error: error.message });
  }
}
