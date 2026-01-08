import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  
  // App-specific tokens (same as kintone.ts)
  const APP_TOKENS: Record<number, string> = {
    303: process.env.KINTONE_TOKEN_EMPLOYEES || '',
    304: process.env.KINTONE_TOKEN_LEAVE_REQUESTS || '',
    305: process.env.KINTONE_TOKEN_DOCUMENT_REQUESTS || '',
    306: process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '',
    307: process.env.KINTONE_TOKEN_LEAVE_BALANCES || '',
    308: process.env.KINTONE_TOKEN_DTR || '',
    309: process.env.KINTONE_TOKEN_PAYROLL || '',
    310: process.env.KINTONE_TOKEN_BENEFITS || '',
    311: process.env.KINTONE_TOKEN_LOANS || '',
    312: process.env.KINTONE_TOKEN_SCHEDULES || '',
  };
  
  const token306 = APP_TOKENS[306];
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  const results: any = {
    token306Length: token306.length,
    token306Preview: token306 ? token306.substring(0, 15) + '...' : 'EMPTY',
    today,
    query,
    url,
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': token306 },
    });
    
    const data = await response.json();
    
    results.httpStatus = response.status;
    results.ok = response.ok;
    results.recordCount = data.records?.length || 0;
    results.error = data.code || data.message || null;
    
    if (data.records?.[0]) {
      results.firstTitle = data.records[0].title?.value || 'N/A';
    }
  } catch (e: any) {
    results.exception = e.message;
  }
  
  return NextResponse.json(results);
}
