import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
    const TOKEN = process.env.KINTONE_TOKEN_EMPLOYEES || '';
    
    // Try direct API call
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303&query=email%20%3D%20%22admin%40mscorp.com.ph%22`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.ok ? 'ok' : 'error',
      httpStatus: response.status,
      domain: KINTONE_DOMAIN,
      tokenLength: TOKEN.length,
      tokenPreview: TOKEN.substring(0, 10) + '...',
      url: url,
      response: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
