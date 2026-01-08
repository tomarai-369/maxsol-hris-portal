import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';

export async function GET() {
  try {
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      tokenPreview: KINTONE_API_TOKEN ? KINTONE_API_TOKEN.substring(0, 10) + '...' : 'EMPTY',
      recordCount: data.records?.length || 0,
      error: data.message || data.code || null
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'exception',
      error: error.message
    });
  }
}
