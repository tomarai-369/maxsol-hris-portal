import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeDocumentRequests, createDocumentRequest } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const requests = await getEmployeeDocumentRequests(user.employeeId);

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        documentType: r.documentType,
        purpose: r.purpose,
        quantity: r.quantity,
        status: r.status,
        remarks: r.remarks,
        releaseDate: r.releaseDate,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { documentType, purpose, quantity } = await request.json();

    if (!documentType || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const employeeName = `${user.lastName}, ${user.firstName}`;
    const result = await createDocumentRequest(user.employeeId, employeeName, {
      documentType,
      purpose,
      quantity: quantity || 1,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Document request submitted',
    });
  } catch (error) {
    console.error('Create document request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
