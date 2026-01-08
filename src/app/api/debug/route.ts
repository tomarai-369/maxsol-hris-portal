import { NextResponse } from 'next/server';
import { getActiveAnnouncements, getRecords, KINTONE_APPS } from '@/lib/kintone';

export async function GET() {
  const results: any = {};
  
  // Test 1: Direct getRecords call
  try {
    const data = await getRecords(KINTONE_APPS.ANNOUNCEMENTS, '');
    results.directCall = { success: true, count: data.records?.length || 0 };
  } catch (e: any) {
    results.directCall = { success: false, error: e.message };
  }
  
  // Test 2: getActiveAnnouncements function
  try {
    const announcements = await getActiveAnnouncements();
    results.getActiveAnnouncements = { success: true, count: announcements.length };
  } catch (e: any) {
    results.getActiveAnnouncements = { success: false, error: e.message };
  }
  
  // Test 3: Check env var for token
  results.tokenCheck = {
    hasToken: !!process.env.KINTONE_TOKEN_ANNOUNCEMENTS,
    tokenPreview: process.env.KINTONE_TOKEN_ANNOUNCEMENTS?.substring(0, 10) + '...'
  };

  return NextResponse.json(results);
}
