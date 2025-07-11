import { NextRequest, NextResponse } from 'next/server';

// Mock user notification preferences
interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: {
      project: boolean;
      annotation: boolean;
      billing: boolean;
      system: boolean;
      collaboration: boolean;
    };
    types: {
      info: boolean;
      success: boolean;
      warning: boolean;
      error: boolean;
      system: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    categories: {
      project: boolean;
      annotation: boolean;
      billing: boolean;
      system: boolean;
      collaboration: boolean;
    };
    types: {
      info: boolean;
      success: boolean;
      warning: boolean;
      error: boolean;
      system: boolean;
    };
    showDesktop: boolean;
    playSound: boolean;
  };
  push: {
    enabled: boolean;
    categories: {
      project: boolean;
      annotation: boolean;
      billing: boolean;
      system: boolean;
      collaboration: boolean;
    };
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
      timezone: string;
    };
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    timezone: string;
    includeSummary: boolean;
    includeMetrics: boolean;
  };
  updatedAt: string;
}

// Mock preferences database
let userPreferences: Record<string, NotificationPreferences> = {
  'user-1': {
    userId: 'user-1',
    email: {
      enabled: true,
      frequency: 'immediate',
      categories: {
        project: true,
        annotation: true,
        billing: true,
        system: true,
        collaboration: true,
      },
      types: {
        info: true,
        success: false,
        warning: true,
        error: true,
        system: true,
      },
    },
    inApp: {
      enabled: true,
      categories: {
        project: true,
        annotation: true,
        billing: true,
        system: true,
        collaboration: true,
      },
      types: {
        info: true,
        success: true,
        warning: true,
        error: true,
        system: true,
      },
      showDesktop: true,
      playSound: false,
    },
    push: {
      enabled: false,
      categories: {
        project: false,
        annotation: false,
        billing: true,
        system: true,
        collaboration: false,
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'America/New_York',
      },
    },
    digest: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00',
      timezone: 'America/New_York',
      includeSummary: true,
      includeMetrics: true,
    },
    updatedAt: new Date().toISOString(),
  },
};

// GET /api/notifications/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    const preferences = userPreferences[userId];

    if (!preferences) {
      // Return default preferences if none exist
      const defaultPreferences: NotificationPreferences = {
        userId,
        email: {
          enabled: true,
          frequency: 'immediate',
          categories: {
            project: true,
            annotation: true,
            billing: true,
            system: true,
            collaboration: true,
          },
          types: {
            info: true,
            success: false,
            warning: true,
            error: true,
            system: true,
          },
        },
        inApp: {
          enabled: true,
          categories: {
            project: true,
            annotation: true,
            billing: true,
            system: true,
            collaboration: true,
          },
          types: {
            info: true,
            success: true,
            warning: true,
            error: true,
            system: true,
          },
          showDesktop: true,
          playSound: false,
        },
        push: {
          enabled: false,
          categories: {
            project: false,
            annotation: false,
            billing: true,
            system: true,
            collaboration: false,
          },
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
        digest: {
          enabled: true,
          frequency: 'weekly',
          time: '09:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          includeSummary: true,
          includeMetrics: true,
        },
        updatedAt: new Date().toISOString(),
      };

      // Save default preferences
      userPreferences[userId] = defaultPreferences;

      return NextResponse.json({
        success: true,
        data: { preferences: defaultPreferences },
        message: 'Default notification preferences created',
      });
    }

    return NextResponse.json({
      success: true,
      data: { preferences },
    });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    const currentPreferences = userPreferences[userId];
    
    if (!currentPreferences) {
      return NextResponse.json(
        { success: false, error: 'User preferences not found' },
        { status: 404 }
      );
    }

    // Validate the update data structure
    const allowedSections = ['email', 'inApp', 'push', 'digest'];
    const updates = Object.keys(body).filter(key => allowedSections.includes(key));

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid preference sections provided' },
        { status: 400 }
      );
    }

    // Deep merge the updates with current preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...body,
      userId, // Ensure userId cannot be changed
      updatedAt: new Date().toISOString(),
    };

    // Validate specific fields
    if (body.email?.frequency && !['immediate', 'hourly', 'daily', 'weekly'].includes(body.email.frequency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email frequency' },
        { status: 400 }
      );
    }

    if (body.digest?.frequency && !['daily', 'weekly', 'monthly'].includes(body.digest.frequency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid digest frequency' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (body.push?.quietHours?.start && !timeRegex.test(body.push.quietHours.start)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quiet hours start time format (use HH:MM)' },
        { status: 400 }
      );
    }

    if (body.push?.quietHours?.end && !timeRegex.test(body.push.quietHours.end)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quiet hours end time format (use HH:MM)' },
        { status: 400 }
      );
    }

    if (body.digest?.time && !timeRegex.test(body.digest.time)) {
      return NextResponse.json(
        { success: false, error: 'Invalid digest time format (use HH:MM)' },
        { status: 400 }
      );
    }

    // Save updated preferences
    userPreferences[userId] = updatedPreferences;

    return NextResponse.json({
      success: true,
      data: { preferences: updatedPreferences },
      message: 'Notification preferences updated successfully',
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/preferences - Reset preferences to defaults
export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual user authentication
    const userId = 'user-1';

    const defaultPreferences: NotificationPreferences = {
      userId,
      email: {
        enabled: true,
        frequency: 'immediate',
        categories: {
          project: true,
          annotation: true,
          billing: true,
          system: true,
          collaboration: true,
        },
        types: {
          info: true,
          success: false,
          warning: true,
          error: true,
          system: true,
        },
      },
      inApp: {
        enabled: true,
        categories: {
          project: true,
          annotation: true,
          billing: true,
          system: true,
          collaboration: true,
        },
        types: {
          info: true,
          success: true,
          warning: true,
          error: true,
          system: true,
        },
        showDesktop: true,
        playSound: false,
      },
      push: {
        enabled: false,
        categories: {
          project: false,
          annotation: false,
          billing: true,
          system: true,
          collaboration: false,
        },
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
      digest: {
        enabled: true,
        frequency: 'weekly',
        time: '09:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        includeSummary: true,
        includeMetrics: true,
      },
      updatedAt: new Date().toISOString(),
    };

    // Reset to defaults
    userPreferences[userId] = defaultPreferences;

    return NextResponse.json({
      success: true,
      data: { preferences: defaultPreferences },
      message: 'Notification preferences reset to defaults',
    });

  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset notification preferences' },
      { status: 500 }
    );
  }
} 