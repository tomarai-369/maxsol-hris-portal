import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  
  const tokens: Record<string, string> = {
    EMPLOYEES: process.env.KINTONE_TOKEN_EMPLOYEES || '',
    LEAVE_REQUESTS: process.env.KINTONE_TOKEN_LEAVE_REQUESTS || '',
    DOCUMENT_REQUESTS: process.env.KINTONE_TOKEN_DOCUMENT_REQUESTS || '',
    ANNOUNCEMENTS: process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '',
    LEAVE_BALANCES: process.env.KINTONE_TOKEN_LEAVE_BALANCES || '',
    DTR: process.env.KINTONE_TOKEN_DTR || '',
    PAYROLL: process.env.KINTONE_TOKEN_PAYROLL || '',
    BENEFITS: process.env.KINTONE_TOKEN_BENEFITS || '',
    LOANS: process.env.KINTONE_TOKEN_LOANS || '',
    SCHEDULES: process.env.KINTONE_TOKEN_SCHEDULES || '',
  };

  // Test announcements directly
  const annToken = tokens.ANNOUNCEMENTS;
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  let annResult: any = {};
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': annToken },
    });
    const data = await response.json();
    annResult = {
      status: response.status,
      records: data.records?.length || 0,
      error: data.code || null
    };
  } catch (e: any) {
    annResult = { error: e.message };
  }

  return NextResponse.json({
    tokens: Object.fromEntries(
      Object.entries(tokens).map(([k, v]) => [k, v ? v.substring(0, 10) + '...' : 'EMPTY'])
    ),
    announcementsTest: annResult
  });
}
