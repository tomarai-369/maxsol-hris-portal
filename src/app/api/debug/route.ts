import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';
  
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
  const results: any = {};

  // Test 1: Basic (current approach)
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    const data = await resp.json();
    results.test1_basic = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.test1_basic = { error: e.message }; }

  // Test 2: With Origin header
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
        'Content-Type': 'application/json',
        'Origin': `https://${KINTONE_DOMAIN}`,
      },
    });
    const data = await resp.json();
    results.test2_withOrigin = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.test2_withOrigin = { error: e.message }; }

  // Test 3: With User-Agent
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const data = await resp.json();
    results.test3_withUserAgent = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.test3_withUserAgent = { error: e.message }; }

  // Test 4: Minimal headers
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
      },
    });
    const data = await resp.json();
    results.test4_minimal = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.test4_minimal = { error: e.message }; }

  // Test 5: Using node's https directly
  try {
    const https = require('https');
    const data = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'X-Cybozu-API-Token': KINTONE_API_TOKEN,
          'Content-Type': 'application/json',
        }
      }, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    }) as any;
    const json = JSON.parse(data.body);
    results.test5_https = { status: data.status, records: json.records?.length, error: json.code };
  } catch (e: any) { results.test5_https = { error: e.message }; }

  return NextResponse.json(results);
}
