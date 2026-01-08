import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_USER = process.env.KINTONE_USER || '';
const KINTONE_PASS = process.env.KINTONE_PASS || '';

export async function GET() {
  const credentials = `${KINTONE_USER}:${KINTONE_PASS}`;
  const authHeader = Buffer.from(credentials).toString('base64');
  
  try {
    // Simpler query - just get records without query param
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
    
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
      // Show full auth header for debugging
      authHeaderFull: authHeader,
      authHeaderExpected: 'QWRtaW5pc3RyYXRvcjpFZGFtYW1lITIzNDU=',
      authMatch: authHeader === 'QWRtaW5pc3RyYXRvcjpFZGFtYW1lITIzNDU=',
      user: KINTONE_USER,
      pass: KINTONE_PASS ? `${KINTONE_PASS.substring(0,3)}...${KINTONE_PASS.length}chars` : 'EMPTY',
      url,
      recordCount: data.records?.length || 0,
      error: data.message || data.code || null
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'exception',
      error: error.message,
      user: KINTONE_USER,
      pass: KINTONE_PASS ? `${KINTONE_PASS.substring(0,3)}...` : 'EMPTY'
    });
  }
}
