import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications/mark-read - Mark specific notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, markAll = false } = body;

    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    if (!markAll && (!notificationIds || !Array.isArray(notificationIds))) {
      return NextResponse.json(
        { success: false, error: 'Either provide notificationIds array or set markAll to true' },
        { status: 400 }
      );
    }

    // This would typically interact with the same data source as the main notifications API
    // For now, we'll simulate the operation
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'markRead',
        notificationIds: markAll ? 'all' : notificationIds,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read');
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result.data,
      message: markAll ? 'All notifications marked as read' : `${result.data.updatedCount} notifications marked as read`,
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/mark-read - Mark single notification as read
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'markRead',
        notificationIds: [notificationId],
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Notification marked as read',
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
} 