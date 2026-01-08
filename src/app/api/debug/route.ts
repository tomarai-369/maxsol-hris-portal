import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const TOKEN_ANN = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';
  
  const results: any = {
    tokens: {
      announcements: TOKEN_ANN ? TOKEN_ANN.substring(0, 10) + '...' : 'EMPTY',
      annLength: TOKEN_ANN.length
    }
  };
  
  // Test announcements
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': TOKEN_ANN },
    });
    const data = await response.json();
    results.announcements = {
      status: response.status,
      ok: response.ok,
      recordCount: data.records?.length,
      error: data.code,
      message: data.message
    };
  } catch (e: any) {
    results.announcements = { error: e.message };
  }
  
  return NextResponse.json(results);
}
