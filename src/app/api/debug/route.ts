import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const results: any = {};
  
  // Test each app with its specific token
  const appTests = [
    { id: 303, name: 'Employees', token: process.env.KINTONE_TOKEN_EMPLOYEES },
    { id: 304, name: 'Leave Requests', token: process.env.KINTONE_TOKEN_LEAVE_REQUESTS },
    { id: 306, name: 'Announcements', token: process.env.KINTONE_TOKEN_ANNOUNCEMENTS },
    { id: 307, name: 'Leave Balances', token: process.env.KINTONE_TOKEN_LEAVE_BALANCES },
    { id: 308, name: 'DTR', token: process.env.KINTONE_TOKEN_DTR },
  ];

  for (const app of appTests) {
    const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=${app.id}`;
    try {
      const resp = await fetch(url, {
        headers: { 'X-Cybozu-API-Token': app.token || '' }
      });
      const data = await resp.json();
      results[`app_${app.id}_${app.name}`] = {
        tokenSet: !!app.token,
        tokenPreview: app.token ? app.token.substring(0, 10) + '...' : 'EMPTY',
        status: resp.status,
        ok: resp.ok,
        records: data.records?.length || 0,
        error: data.code || null
      };
    } catch (e: any) {
      results[`app_${app.id}_${app.name}`] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
