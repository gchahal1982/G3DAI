import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications/send - Send notification to user(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      recipientIds, 
      recipientType = 'specific', // 'specific', 'all', 'role', 'organization'
      type, 
      title, 
      message, 
      category, 
      priority = 'medium',
      actionUrl,
      actionText,
      metadata = {},
      channels = ['inApp'], // 'inApp', 'email', 'push'
      scheduleAt,
      expiresAt
    } = body;

    // Validate required fields
    if (!type || !title || !message || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, message, category' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validTypes = ['info', 'success', 'warning', 'error', 'system'];
    const validCategories = ['project', 'annotation', 'billing', 'system', 'collaboration'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const validChannels = ['inApp', 'email', 'push'];
    const validRecipientTypes = ['specific', 'all', 'role', 'organization'];

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

    if (!validRecipientTypes.includes(recipientType)) {
      return NextResponse.json(
        { success: false, error: `Invalid recipientType. Must be one of: ${validRecipientTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate channels
    const invalidChannels = channels.filter((channel: string) => !validChannels.includes(channel));
    if (invalidChannels.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid channels: ${invalidChannels.join(', ')}. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine recipient user IDs based on recipientType
    let targetUserIds: string[] = [];

    switch (recipientType) {
      case 'specific':
        if (!recipientIds || !Array.isArray(recipientIds)) {
          return NextResponse.json(
            { success: false, error: 'recipientIds array is required for specific recipient type' },
            { status: 400 }
          );
        }
        targetUserIds = recipientIds;
        break;

      case 'all':
        // TODO: In production, fetch all active user IDs from database
        targetUserIds = ['user-1', 'user-2', 'user-3']; // Mock data
        break;

      case 'role':
        // TODO: In production, fetch user IDs by role from database
        const role = metadata.role;
        if (!role) {
          return NextResponse.json(
            { success: false, error: 'role must be specified in metadata for role recipient type' },
            { status: 400 }
          );
        }
        // Mock role-based user lookup
        targetUserIds = role === 'admin' ? ['user-1'] : ['user-2', 'user-3'];
        break;

      case 'organization':
        // TODO: In production, fetch user IDs by organization from database
        const organizationId = metadata.organizationId;
        if (!organizationId) {
          return NextResponse.json(
            { success: false, error: 'organizationId must be specified in metadata for organization recipient type' },
            { status: 400 }
          );
        }
        // Mock organization-based user lookup
        targetUserIds = ['user-1', 'user-2'];
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid recipient type' },
          { status: 400 }
        );
    }

    // Validate schedule time if provided
    if (scheduleAt && new Date(scheduleAt) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'scheduleAt must be in the future' },
        { status: 400 }
      );
    }

    // Create notifications for each recipient
    const notifications = [];
    const failedRecipients = [];

    for (const userId of targetUserIds) {
      try {
        // Check user notification preferences
        const preferencesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications/preferences?userId=${userId}`);
        
        let shouldSend = true;
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          const preferences = preferencesData.data.preferences;

          // Check if user has notifications enabled for this category and type
          if (channels.includes('inApp') && preferences.inApp) {
            shouldSend = preferences.inApp.categories[category] && preferences.inApp.types[type];
          }
          
          if (channels.includes('email') && preferences.email) {
            shouldSend = shouldSend && preferences.email.categories[category] && preferences.email.types[type];
          }

          if (channels.includes('push') && preferences.push) {
            shouldSend = shouldSend && preferences.push.categories[category];
          }
        }

        if (!shouldSend) {
          failedRecipients.push({ userId, reason: 'User preferences disabled for this notification type' });
          continue;
        }

        // Create the notification
        const notificationData = {
          userId,
          type,
          title,
          message,
          category,
          priority,
          actionUrl,
          actionText,
          metadata: {
            ...metadata,
            channels,
            recipientType,
            scheduleAt,
          },
          expiresAt,
        };

        if (scheduleAt) {
          // TODO: In production, add to job queue for scheduled delivery
          notificationData.metadata.scheduledFor = scheduleAt;
        }

        // Create the notification via the main notifications API
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationData),
        });

        if (createResponse.ok) {
          const createdNotification = await createResponse.json();
          notifications.push(createdNotification.data.notification);

          // Send via additional channels if requested
          if (channels.includes('email')) {
            // TODO: Send email notification
            // await sendEmailNotification(userId, notificationData);
          }

          if (channels.includes('push')) {
            // TODO: Send push notification
            // await sendPushNotification(userId, notificationData);
          }

          // Send real-time notification if inApp channel is enabled
          if (channels.includes('inApp')) {
            // TODO: Send via WebSocket
            // await sendRealtimeNotification(createdNotification.data.notification);
          }
        } else {
          failedRecipients.push({ userId, reason: 'Failed to create notification' });
        }

      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        failedRecipients.push({ userId, reason: error.message });
      }
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        sent: notifications.length,
        failed: failedRecipients.length,
        notifications,
        failedRecipients,
        channels,
        scheduled: !!scheduleAt,
      },
      message: scheduleAt 
        ? `${notifications.length} notifications scheduled for ${new Date(scheduleAt).toISOString()}`
        : `${notifications.length} notifications sent successfully`,
    };

    if (failedRecipients.length > 0) {
      response.message += `, ${failedRecipients.length} failed`;
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/send - Get notification sending statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h'; // '1h', '24h', '7d', '30d'
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    // Calculate time range
    const now = new Date();
    let startTime: Date;

    switch (timeframe) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // TODO: In production, fetch actual statistics from database
    // For now, return mock statistics
    const mockStats = {
      timeframe,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      total: {
        sent: 1247,
        delivered: 1198,
        failed: 49,
        pending: 0,
      },
      byChannel: {
        inApp: { sent: 1247, delivered: 1247, failed: 0 },
        email: { sent: 856, delivered: 823, failed: 33 },
        push: { sent: 234, delivered: 218, failed: 16 },
      },
      byCategory: {
        project: { sent: 523, delivered: 510, failed: 13 },
        annotation: { sent: 389, delivered: 378, failed: 11 },
        billing: { sent: 156, delivered: 148, failed: 8 },
        system: { sent: 89, delivered: 87, failed: 2 },
        collaboration: { sent: 90, delivered: 75, failed: 15 },
      },
      byType: {
        info: { sent: 678, delivered: 654, failed: 24 },
        success: { sent: 234, delivered: 231, failed: 3 },
        warning: { sent: 189, delivered: 178, failed: 11 },
        error: { sent: 89, delivered: 82, failed: 7 },
        system: { sent: 57, delivered: 53, failed: 4 },
      },
      topFailureReasons: [
        { reason: 'User preferences disabled', count: 23 },
        { reason: 'Invalid email address', count: 12 },
        { reason: 'Push token expired', count: 8 },
        { reason: 'Rate limit exceeded', count: 6 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: { statistics: mockStats },
    });

  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification statistics' },
      { status: 500 }
    );
  }
} 