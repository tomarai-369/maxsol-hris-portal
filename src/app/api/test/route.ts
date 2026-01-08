import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_USER = process.env.KINTONE_USER || '';
const KINTONE_PASS = process.env.KINTONE_PASS || '';

export async function GET() {
  const authHeader = Buffer.from(`${KINTONE_USER}:${KINTONE_PASS}`).toString('base64');
  
  try {
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303&query=email%20%3D%20%22admin%40mscorp.com.ph%22`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      authHeader: authHeader.substring(0, 20) + '...',
      user: KINTONE_USER,
      passLength: KINTONE_PASS.length,
      url,
      response: data.records ? { recordCount: data.records.length } : data
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'exception',
      error: error.message,
      authHeader: authHeader.substring(0, 20) + '...',
      user: KINTONE_USER,
      passLength: KINTONE_PASS.length
    });
  }
}
