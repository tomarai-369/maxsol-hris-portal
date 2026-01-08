import { NextResponse } from 'next/server';

export async function GET() {
  const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
  
  // Get tokens for different apps
  const tokens = {
    employees: process.env.KINTONE_TOKEN_EMPLOYEES || '',
    announcements: process.env.KINTONE_TOKEN_ANNOUNCEMENTS || '',
    leaveBalances: process.env.KINTONE_TOKEN_LEAVE_BALANCES || '',
  };
  
  const results: any = {
    tokenLengths: {
      employees: tokens.employees.length,
      announcements: tokens.announcements.length,
      leaveBalances: tokens.leaveBalances.length,
    },
    tests: {}
  };

  // Test 1: Employees (303)
  try {
    const resp = await fetch(`https://${KINTONE_DOMAIN}/k/v1/records.json?app=303`, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': tokens.employees },
    });
    const data = await resp.json();
    results.tests.employees = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.tests.employees = { error: e.message }; }

  // Test 2: Announcements (306)
  try {
    const resp = await fetch(`https://${KINTONE_DOMAIN}/k/v1/records.json?app=306`, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': tokens.announcements },
    });
    const data = await resp.json();
    results.tests.announcements = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.tests.announcements = { error: e.message }; }

  // Test 3: Leave Balances (307)
  try {
    const resp = await fetch(`https://${KINTONE_DOMAIN}/k/v1/records.json?app=307`, {
      method: 'GET',
      headers: { 'X-Cybozu-API-Token': tokens.leaveBalances },
    });
    const data = await resp.json();
    results.tests.leaveBalances = { status: resp.status, ok: resp.ok, records: data.records?.length, error: data.code };
  } catch (e: any) { results.tests.leaveBalances = { error: e.message }; }

  return NextResponse.json(results);
}
