import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const TOKEN = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': TOKEN },
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      tokenLength: TOKEN.length,
      tokenPreview: TOKEN.substring(0, 10),
      query,
      url,
      status: response.status,
      ok: response.ok,
      recordCount: data.records?.length,
      error: data.code || data.message || null,
      firstRecord: data.records?.[0]?.title?.value || null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
