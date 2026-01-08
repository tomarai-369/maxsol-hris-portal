import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';

export async function GET() {
  const results: Record<string, any> = {};
  
  // Test each app token
  const apps = [
    { id: 303, name: 'EMPLOYEES', token: process.env.KINTONE_TOKEN_EMPLOYEES },
    { id: 306, name: 'ANNOUNCEMENTS', token: process.env.KINTONE_TOKEN_ANNOUNCEMENTS },
  ];
  
  for (const app of apps) {
    if (!app.token) {
      results[app.name] = { error: 'No token configured' };
      continue;
    }
    
    try {
      const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=${app.id}`;
      const resp = await fetch(url, {
        headers: { 'X-Cybozu-API-Token': app.token }
      });
      const data = await resp.json();
      results[app.name] = {
        status: resp.status,
        ok: resp.ok,
        records: data.records?.length || 0,
        error: data.code || null
      };
    } catch (e: any) {
      results[app.name] = { error: e.message };
    }
  }
  
  return NextResponse.json(results);
}
