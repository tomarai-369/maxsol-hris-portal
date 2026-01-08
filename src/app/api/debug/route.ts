import { NextResponse } from 'next/server';

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';

export async function GET() {
  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
  
  // Show exactly what we're sending
  const requestDetails = {
    url,
    headers: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
      'Content-Type': 'application/json',
    },
    tokenLength: KINTONE_API_TOKEN.length,
    tokenValue: KINTONE_API_TOKEN,
    hasComma: KINTONE_API_TOKEN.includes(','),
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Cybozu-API-Token': KINTONE_API_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    const text = await response.text();
    
    return NextResponse.json({
      request: requestDetails,
      response: {
        status: response.status,
        statusText: response.statusText,
        body: text.substring(0, 500)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      request: requestDetails,
      error: error.message
    });
  }
}
