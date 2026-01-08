import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_USER = process.env.KINTONE_USER || '';
const KINTONE_PASS = process.env.KINTONE_PASS || '';

export async function GET() {
  const credentials = `${KINTONE_USER}:${KINTONE_PASS}`;
  const authHeader = Buffer.from(credentials).toString('base64');
  
  try {
    // Try with additional headers
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'HRIS-Portal/1.0',
      },
      cache: 'no-store',
      // @ts-ignore - Next.js specific
      next: { revalidate: 0 }
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text.substring(0, 500) };
    }
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      authMatch: authHeader === 'QWRtaW5pc3RyYXRvcjpFZGFtYW1lITIzNDU=',
      recordCount: data.records?.length || 0,
      error: data.message || data.code || null,
      data: data.records ? 'has records' : data
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'exception',
      error: error.message,
      stack: error.stack?.substring(0, 300)
    });
  }
}
