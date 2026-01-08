import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getActiveAnnouncements } from '@/lib/kintone';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const announcements = await getActiveAnnouncements();

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category,
        priority: a.priority,
        publishDate: a.publishDate,
      })),
    });
  } catch (error: any) {
    console.error('Get announcements error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', details: error.message },
      { status: 500 }
    );
  }
}
