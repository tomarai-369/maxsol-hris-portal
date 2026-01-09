import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const TOKEN = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';
  
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active in ("Yes") and publish_date <= "${today}" order by priority desc limit 20`;
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${encodeURIComponent(query)}`;
  
  const result: any = {
    tokenSet: !!TOKEN,
    tokenLength: TOKEN.length,
    tokenPreview: TOKEN.substring(0, 10) + '...',
    query,
    url
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': TOKEN },
    });
    
    const data = await response.json();
    result.status = response.status;
    result.ok = response.ok;
    result.recordCount = data.records?.length || 0;
    result.error = data.code || null;
    result.message = data.message || null;
    
    if (data.records?.length > 0) {
      result.firstRecord = {
        title: data.records[0].title?.value,
        is_active: data.records[0].is_active?.value,
        publish_date: data.records[0].publish_date?.value
      };
    }
  } catch (e: any) {
    result.exception = e.message;
  }

  return NextResponse.json(result);
}
