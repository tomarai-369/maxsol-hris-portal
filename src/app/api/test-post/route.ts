import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
