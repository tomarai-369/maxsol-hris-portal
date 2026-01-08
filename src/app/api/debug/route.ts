import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';
  
  // Get all env vars related to Kintone
  const envVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.includes('KINTONE') || key.includes('JWT')) {
      envVars[key] = typeof value === 'string' ? 
        (value.length > 50 ? value.substring(0, 50) + '...' : value) : 
        'undefined';
    }
  }

  const url = `https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`;
  
  // Try with explicit headers
  const headers = new Headers();
  headers.set('X-Cybozu-API-Token', KINTONE_API_TOKEN);
  headers.set('Content-Type', 'application/json');
  
  let result: any = {
    envVars,
    tokenUsed: KINTONE_API_TOKEN,
    tokenLength: KINTONE_API_TOKEN.length,
    url,
    headersSet: {
      'X-Cybozu-API-Token': KINTONE_API_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    const text = await response.text();
    
    result.response = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: text
    };
  } catch (error: any) {
    result.error = {
      message: error.message,
      stack: error.stack?.substring(0, 300)
    };
  }

  return NextResponse.json(result, { 
    headers: { 'Content-Type': 'application/json' }
  });
}
