import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecords, KINTONE_APPS } from '@/lib/kintone';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentFilter = searchParams.get('department');

    // Build employee query
    let employeeQuery = '';
    if (departmentFilter && departmentFilter !== 'all') {
      employeeQuery = `department = "${departmentFilter}"`;
    }

    // Fetch all data in parallel
    const [employeesRes, leaveRes, documentsRes] = await Promise.all([
      getRecords(KINTONE_APPS.EMPLOYEES, employeeQuery, undefined, true),
      getRecords(KINTONE_APPS.LEAVE_REQUESTS, 'order by created_at desc limit 500'),
      getRecords(KINTONE_APPS.DOCUMENT_REQUESTS, 'order by created_at desc limit 500'),
    ]);

    const employees = employeesRes.records || [];
    const leaveRequests = leaveRes.records || [];
    const documentRequests = documentsRes.records || [];

    // Calculate employee stats
    const employeesByDepartment: Record<string, number> = {};
    const employeesByStatus: Record<string, number> = {};

    employees.forEach((emp: any) => {
      const dept = emp.department?.value || 'Unknown';
      const status = emp.employment_status?.value || 'Unknown';
      
      employeesByDepartment[dept] = (employeesByDepartment[dept] || 0) + 1;
      employeesByStatus[status] = (employeesByStatus[status] || 0) + 1;
    });

    // Calculate leave stats
    const leaveStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: leaveRequests.length,
    };

    leaveRequests.forEach((req: any) => {
      const status = req.status?.value?.toLowerCase();
      if (status === 'pending') leaveStats.pending++;
      else if (status === 'approved') leaveStats.approved++;
      else if (status === 'rejected') leaveStats.rejected++;
    });

    // Calculate document stats
    const documentStats = {
      pending: 0,
      processing: 0,
      ready: 0,
      released: 0,
      total: documentRequests.length,
    };

    documentRequests.forEach((req: any) => {
      const status = req.status?.value?.toLowerCase();
      if (status === 'pending') documentStats.pending++;
      else if (status === 'processing') documentStats.processing++;
      else if (status === 'ready') documentStats.ready++;
      else if (status === 'released') documentStats.released++;
    });

    // Format recent leave requests
    const recentLeaveRequests = leaveRequests.slice(0, 20).map((r: any) => ({
      id: parseInt(r.$id?.value),
      employeeName: r.employee_name?.value || '',
      leaveType: r.leave_type?.value || '',
      startDate: r.start_date?.value || '',
      endDate: r.end_date?.value || '',
      status: r.status?.value || 'Pending',
      totalDays: parseFloat(r.total_days?.value || '0'),
    }));

    // Format recent document requests
    const recentDocumentRequests = documentRequests.slice(0, 20).map((r: any) => ({
      id: parseInt(r.$id?.value),
      employeeName: r.employee_name?.value || '',
      documentType: r.document_type?.value || '',
      status: r.status?.value || 'Pending',
      createdAt: r.created_at?.value || '',
    }));

    return NextResponse.json({
      totalEmployees: employees.length,
      employeesByDepartment,
      employeesByStatus,
      leaveStats,
      documentStats,
      recentLeaveRequests,
      recentDocumentRequests,
    });

  } catch (error) {
    console.error('Executive dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
