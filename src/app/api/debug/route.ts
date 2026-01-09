import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const results: any = {};

  // Test each app token
  const apps = [
    { id: 303, name: 'Employees', tokenVar: 'KINTONE_TOKEN_EMPLOYEES' },
    { id: 304, name: 'Leave Requests', tokenVar: 'KINTONE_TOKEN_LEAVE_REQUESTS' },
    { id: 305, name: 'Document Requests', tokenVar: 'KINTONE_TOKEN_DOCUMENT_REQUESTS' },
    { id: 306, name: 'Announcements', tokenVar: 'KINTONE_TOKEN_ANNOUNCEMENTS' },
    { id: 307, name: 'Leave Balances', tokenVar: 'KINTONE_TOKEN_LEAVE_BALANCES' },
    { id: 308, name: 'DTR', tokenVar: 'KINTONE_TOKEN_DTR' },
    { id: 309, name: 'Payroll', tokenVar: 'KINTONE_TOKEN_PAYROLL' },
    { id: 310, name: 'Benefits', tokenVar: 'KINTONE_TOKEN_BENEFITS' },
    { id: 311, name: 'Loans', tokenVar: 'KINTONE_TOKEN_LOANS' },
    { id: 312, name: 'Schedules', tokenVar: 'KINTONE_TOKEN_SCHEDULES' },
  ];

  for (const app of apps) {
    const token = process.env[app.tokenVar] || '';
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=${app.id}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-Cybozu-API-Token': token },
      });
      const data = await response.json();
      results[app.name] = {
        appId: app.id,
        tokenSet: !!token,
        status: response.status,
        ok: response.ok,
        records: data.records?.length || 0,
        error: data.code || null
      };
    } catch (e: any) {
      results[app.name] = { appId: app.id, error: e.message };
    }
  }

  return NextResponse.json(results);
}
