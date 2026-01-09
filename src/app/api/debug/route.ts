import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';

export async function GET() {
  const results: any = {};
  
  // Test Announcements specifically
  const token = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';
  results.tokenSet = !!token;
  results.tokenPreview = token ? token.substring(0, 15) + '...' : 'EMPTY';
  
  // Test 1: Simple query (no conditions)
  try {
    const url1 = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306`;
    const resp1 = await fetch(url1, {
      headers: { 'X-Cybozu-API-Token': token }
    });
    const data1 = await resp1.json();
    results.test1_simple = {
      status: resp1.status,
      records: data1.records?.length || 0,
      error: data1.code || null
    };
  } catch (e: any) { results.test1_simple = { error: e.message }; }

  // Test 2: With is_active query
  try {
    const query = encodeURIComponent('is_active in ("Yes")');
    const url2 = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${query}`;
    const resp2 = await fetch(url2, {
      headers: { 'X-Cybozu-API-Token': token }
    });
    const data2 = await resp2.json();
    results.test2_with_query = {
      status: resp2.status,
      records: data2.records?.length || 0,
      error: data2.code || null
    };
  } catch (e: any) { results.test2_with_query = { error: e.message }; }

  // Test 3: Full query like in getActiveAnnouncements
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = encodeURIComponent(`is_active in ("Yes") order by priority desc limit 20`);
    const url3 = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=306&query=${query}`;
    const resp3 = await fetch(url3, {
      headers: { 'X-Cybozu-API-Token': token }
    });
    const data3 = await resp3.json();
    results.test3_full_query = {
      status: resp3.status,
      records: data3.records?.length || 0,
      error: data3.code || null
    };
  } catch (e: any) { results.test3_full_query = { error: e.message }; }

  return NextResponse.json(results);
}
