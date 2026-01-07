import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEmployeeDocumentRequests, createDocumentRequest } from '@/lib/kintone';

// Get document requests
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const requests = await getEmployeeDocumentRequests(user.id);

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        documentType: r.documentType,
        purpose: r.purpose,
        quantity: r.quantity,
        status: r.status,
        releaseDate: r.releaseDate,
        remarks: r.remarks,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get document requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document requests' },
      { status: 500 }
    );
  }
}

// Create document request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { documentType, purpose, quantity } = await request.json();

    if (!documentType || !purpose) {
      return NextResponse.json(
        { error: 'Document type and purpose are required' },
        { status: 400 }
      );
    }

    const employeeName = `${user.firstName} ${user.lastName}`;

    const result = await createDocumentRequest(user.id, employeeName, {
      documentType,
      purpose,
      quantity: quantity || 1,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'Document request submitted successfully',
    });
  } catch (error) {
    console.error('Create document request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit document request' },
      { status: 500 }
    );
  }
}
