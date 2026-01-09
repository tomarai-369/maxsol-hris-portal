import { NextResponse } from 'next/server';
import { getActiveAnnouncements, getRecords, KINTONE_APPS } from '@/lib/kintone';

export async function GET() {
  const results: any = {};

  // Test 1: Direct Kintone call for Employees (303)
  try {
    const empData = await getRecords(KINTONE_APPS.EMPLOYEES, '', undefined, false);
    results.employees = {
      status: 'ok',
      count: empData.records?.length || 0
    };
  } catch (e: any) {
    results.employees = { status: 'error', message: e.message };
  }

  // Test 2: Announcements (306)
  try {
    const annData = await getActiveAnnouncements();
    results.announcements = {
      status: 'ok',
      count: annData.length,
      sample: annData[0]?.title || null
    };
  } catch (e: any) {
    results.announcements = { status: 'error', message: e.message };
  }

  // Test 3: Leave Balances (307)
  try {
    const lbData = await getRecords(KINTONE_APPS.LEAVE_BALANCES, '', undefined, false);
    results.leaveBalances = {
      status: 'ok',
      count: lbData.records?.length || 0
    };
  } catch (e: any) {
    results.leaveBalances = { status: 'error', message: e.message };
  }

  // Test 4: Leave Requests (304)
  try {
    const lrData = await getRecords(KINTONE_APPS.LEAVE_REQUESTS, '', undefined, false);
    results.leaveRequests = {
      status: 'ok',
      count: lrData.records?.length || 0
    };
  } catch (e: any) {
    results.leaveRequests = { status: 'error', message: e.message };
  }

  // Test 5: DTR (308)
  try {
    const dtrData = await getRecords(KINTONE_APPS.DTR, '', undefined, false);
    results.dtr = {
      status: 'ok',
      count: dtrData.records?.length || 0
    };
  } catch (e: any) {
    results.dtr = { status: 'error', message: e.message };
  }

  // Test 6: Payroll (309)
  try {
    const payData = await getRecords(KINTONE_APPS.PAYROLL, '', undefined, false);
    results.payroll = {
      status: 'ok',
      count: payData.records?.length || 0
    };
  } catch (e: any) {
    results.payroll = { status: 'error', message: e.message };
  }

  return NextResponse.json(results);
}
