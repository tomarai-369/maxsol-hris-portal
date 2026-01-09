import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const TOKEN_ANNOUNCEMENTS = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  const results: any = {
    token: TOKEN_ANNOUNCEMENTS ? TOKEN_ANNOUNCEMENTS.substring(0, 10) + '...' : 'MISSING',
    query,
    url
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': TOKEN_ANNOUNCEMENTS },
    });
    
    const data = await response.json();
    results.status = response.status;
    results.records = data.records?.length || 0;
    results.error = data.code || null;
    results.message = data.message || null;
  } catch (e: any) {
    results.exception = e.message;
  }

  return NextResponse.json(results);
}
