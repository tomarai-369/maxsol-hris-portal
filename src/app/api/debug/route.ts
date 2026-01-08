import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';
const KINTONE_USER = process.env.KINTONE_USER || 'Administrator';
const KINTONE_PASS = process.env.KINTONE_PASS || 'Edamame!2345';

export async function GET() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
  const authHeader = Buffer.from(`${KINTONE_USER}:${KINTONE_PASS}`).toString('base64');
  
  const results: any = {
    apiToken: { tokenLength: KINTONE_API_TOKEN.length },
    passwordAuth: { user: KINTONE_USER, passLength: KINTONE_PASS.length }
  };
  
  // Test with API Token
  try {
    const resp1 = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': KINTONE_API_TOKEN, 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    const data1 = await resp1.json();
    results.apiToken.status = resp1.status;
    results.apiToken.success = resp1.ok;
    results.apiToken.recordCount = data1.records?.length || 0;
    results.apiToken.error = data1.code || null;
  } catch (e: any) {
    results.apiToken.exception = e.message;
  }
  
  // Test with Password Auth
  try {
    const resp2 = await fetch(url, {
      method: 'GET',
      headers: { 'X-Cybozu-Authorization': authHeader, 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    const data2 = await resp2.json();
    results.passwordAuth.status = resp2.status;
    results.passwordAuth.success = resp2.ok;
    results.passwordAuth.recordCount = data2.records?.length || 0;
    results.passwordAuth.error = data2.code || null;
  } catch (e: any) {
    results.passwordAuth.exception = e.message;
  }
  
  return NextResponse.json(results);
}
