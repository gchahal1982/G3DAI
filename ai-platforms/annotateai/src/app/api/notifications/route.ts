import { NextRequest, NextResponse } from 'next/server';

// Mock notification data for development
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  category: 'project' | 'annotation' | 'billing' | 'system' | 'collaboration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

// Mock notifications database
let notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'success',
    title: 'Project Created Successfully',
    message: 'Your new project "Medical Image Segmentation" has been created and is ready for annotation.',
    category: 'project',
    priority: 'medium',
    isRead: false,
    isArchived: false,
    actionUrl: '/projects/proj-1',
    actionText: 'View Project',
    metadata: { projectId: 'proj-1', projectName: 'Medical Image Segmentation' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'info',
    title: 'New Team Member Added',
    message: 'Dr. Sarah Wilson has been added to your project team as an Annotator.',
    category: 'collaboration',
    priority: 'low',
    isRead: false,
    isArchived: false,
    actionUrl: '/projects/proj-1/team',
    actionText: 'View Team',
    metadata: { projectId: 'proj-1', memberEmail: 'sarah.wilson@hospital.com' },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'warning',
    title: 'Annotation Quality Review Required',
    message: '15 annotations in your project require quality review before export.',
    category: 'annotation',
    priority: 'high',
    isRead: true,
    isArchived: false,
    actionUrl: '/projects/proj-1/review',
    actionText: 'Review Annotations',
    metadata: { projectId: 'proj-1', pendingCount: 15 },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'error',
    title: 'Payment Method Expired',
    message: 'Your credit card ending in 4242 has expired. Please update your payment method to continue using AnnotateAI.',
    category: 'billing',
    priority: 'urgent',
    isRead: false,
    isArchived: false,
    actionUrl: '/settings/billing',
    actionText: 'Update Payment',
    metadata: { lastFour: '4242', expiryDate: '12/24' },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'system',
    title: 'Scheduled Maintenance',
    message: 'AnnotateAI will undergo scheduled maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM UTC.',
    category: 'system',
    priority: 'medium',
    isRead: true,
    isArchived: false,
    metadata: { maintenanceStart: '2025-01-28T02:00:00Z', maintenanceEnd: '2025-01-28T04:00:00Z' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/notifications - Get user notifications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');
    const isArchived = searchParams.get('isArchived') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    // Filter notifications
    let filteredNotifications = notifications.filter(notif => 
      notif.userId === userId && notif.isArchived === isArchived
    );

    if (category) {
      filteredNotifications = filteredNotifications.filter(notif => notif.category === category);
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(notif => notif.priority === priority);
    }

    if (isRead !== null) {
      const readFilter = isRead === 'true';
      filteredNotifications = filteredNotifications.filter(notif => notif.isRead === readFilter);
    }

    // Sort notifications
    filteredNotifications.sort((a, b) => {
      const aValue = a[sortBy as keyof Notification];
      const bValue = b[sortBy as keyof Notification];
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: filteredNotifications.length,
      unread: filteredNotifications.filter(n => !n.isRead).length,
      urgent: filteredNotifications.filter(n => n.priority === 'urgent').length,
      byCategory: {
        project: filteredNotifications.filter(n => n.category === 'project').length,
        annotation: filteredNotifications.filter(n => n.category === 'annotation').length,
        billing: filteredNotifications.filter(n => n.category === 'billing').length,
        system: filteredNotifications.filter(n => n.category === 'system').length,
        collaboration: filteredNotifications.filter(n => n.category === 'collaboration').length,
      },
      byType: {
        info: filteredNotifications.filter(n => n.type === 'info').length,
        success: filteredNotifications.filter(n => n.type === 'success').length,
        warning: filteredNotifications.filter(n => n.type === 'warning').length,
        error: filteredNotifications.filter(n => n.type === 'error').length,
        system: filteredNotifications.filter(n => n.type === 'system').length,
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: filteredNotifications.length,
          totalPages: Math.ceil(filteredNotifications.length / limit),
          hasNext: endIndex < filteredNotifications.length,
          hasPrev: page > 1,
        },
        stats,
      },
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { userId, type, title, message, category, priority = 'medium' } = body;
    
    if (!userId || !type || !title || !message || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, type, title, message, category' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validTypes = ['info', 'success', 'warning', 'error', 'system'];
    const validCategories = ['project', 'annotation', 'billing', 'system', 'collaboration'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Create new notification
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      category,
      priority,
      isRead: false,
      isArchived: false,
      actionUrl: body.actionUrl,
      actionText: body.actionText,
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
      expiresAt: body.expiresAt,
    };

    // Add to mock database
    notifications.push(newNotification);

    // TODO: In production, also send real-time notification via WebSocket
    // await sendRealtimeNotification(newNotification);

    return NextResponse.json({
      success: true,
      data: { notification: newNotification },
      message: 'Notification created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Bulk update notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationIds, userId } = body;

    if (!action || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, notificationIds (array)' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual user authentication
    const currentUserId = userId || 'user-1';

    let updatedCount = 0;

    switch (action) {
      case 'markRead':
        notifications = notifications.map(notif => {
          if (notificationIds.includes(notif.id) && notif.userId === currentUserId && !notif.isRead) {
            updatedCount++;
            return { ...notif, isRead: true, readAt: new Date().toISOString() };
          }
          return notif;
        });
        break;

      case 'markUnread':
        notifications = notifications.map(notif => {
          if (notificationIds.includes(notif.id) && notif.userId === currentUserId && notif.isRead) {
            updatedCount++;
            return { ...notif, isRead: false, readAt: undefined };
          }
          return notif;
        });
        break;

      case 'archive':
        notifications = notifications.map(notif => {
          if (notificationIds.includes(notif.id) && notif.userId === currentUserId && !notif.isArchived) {
            updatedCount++;
            return { ...notif, isArchived: true };
          }
          return notif;
        });
        break;

      case 'unarchive':
        notifications = notifications.map(notif => {
          if (notificationIds.includes(notif.id) && notif.userId === currentUserId && notif.isArchived) {
            updatedCount++;
            return { ...notif, isArchived: false };
          }
          return notif;
        });
        break;

      case 'delete':
        const initialLength = notifications.length;
        notifications = notifications.filter(notif => 
          !(notificationIds.includes(notif.id) && notif.userId === currentUserId)
        );
        updatedCount = initialLength - notifications.length;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Must be one of: markRead, markUnread, archive, unarchive, delete' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { updatedCount },
      message: `Successfully ${action}ed ${updatedCount} notifications`,
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete all notifications for user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isArchived = searchParams.get('isArchived') === 'true';

    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    const initialLength = notifications.length;

    // Filter notifications to delete
    notifications = notifications.filter(notif => {
      if (notif.userId !== userId) return true; // Keep notifications for other users
      
      if (category && notif.category !== category) return true; // Keep different categories
      if (isArchived !== null && notif.isArchived !== isArchived) return true; // Keep different archive status
      
      return false; // Delete this notification
    });

    const deletedCount = initialLength - notifications.length;

    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `Successfully deleted ${deletedCount} notifications`,
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
} 