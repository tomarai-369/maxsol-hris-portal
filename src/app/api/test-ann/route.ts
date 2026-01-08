import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || 'NOT_SET';
  const domain = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const url = `https://${domain}/k/v1/records.json?app=306`;
  
  try {
    const resp = await fetch(url, {
      headers: { 'X-Cybozu-API-Token': token }
    });
    const data = await resp.json();
    
    return NextResponse.json({
      tokenSet: token !== 'NOT_SET',
      tokenPreview: token.substring(0, 10) + '...',
      status: resp.status,
      recordCount: data.records?.length || 0,
      error: data.code || null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
