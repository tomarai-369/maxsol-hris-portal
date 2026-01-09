import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {};
  
  // Test App 306 (Announcements)
  const token306 = process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '';
  results.token306 = { length: token306.length, first10: token306.substring(0,10) };
  
  try {
    const resp = await fetch('https://ms-corp.cybozu.com/k/v1/records.json?app=306', {
      headers: { 'X-Cybozu-API-Token': token306 }
    });
    const data = await resp.json();
    results.app306 = { status: resp.status, records: data.records?.length, error: data.code };
  } catch (e: any) { results.app306 = { error: e.message }; }

  // Test App 308 (DTR)
  const token308 = process.env.KINTONE_TOKEN_DTR || '';
  results.token308 = { length: token308.length, first10: token308.substring(0,10) };
  
  try {
    const resp = await fetch('https://ms-corp.cybozu.com/k/v1/records.json?app=308', {
      headers: { 'X-Cybozu-API-Token': token308 }
    });
    const data = await resp.json();
    results.app308 = { status: resp.status, records: data.records?.length, error: data.code };
  } catch (e: any) { results.app308 = { error: e.message }; }

  return NextResponse.json(results);
}
