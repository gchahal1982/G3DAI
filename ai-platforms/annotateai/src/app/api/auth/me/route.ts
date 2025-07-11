import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/types/auth';

// Mock user database (same as in login/signup - in production, use actual database)
const mockUsers = [
  {
    id: '1',
    email: 'demo@annotateai.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Demo',
    lastName: 'User',
    avatar: null,
    role: 'admin' as const,
    subscription: {
      id: 'sub-1',
      plan: 'pro' as const,
      status: 'active' as const,
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-12-31'),
      cancelAtPeriodEnd: false,
      usage: {
        projects: 5,
        storage: 2.5,
        apiCalls: 1250,
        annotations: 25000,
        teamMembers: 3,
        modelTraining: 2,
        exports: 45
      },
      limits: {
        projects: 25,
        storage: 50,
        apiCalls: 50000,
        annotations: 500000,
        teamMembers: 10,
        modelTraining: 10,
        exports: 1000,
        supportLevel: 'priority' as const,
        features: ['basic_annotation', 'advanced_annotation', 'collaboration', 'api_access']
      }
    },
    preferences: {
      theme: 'dark' as const,
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: {
          projectUpdates: true,
          teamInvites: true,
          billingAlerts: true,
          securityAlerts: true,
          productUpdates: false,
          weeklyDigest: true
        },
        push: {
          projectUpdates: true,
          mentions: true,
          deadlines: true,
          systemAlerts: true
        },
        inApp: {
          projectUpdates: true,
          teamActivity: true,
          systemNotifications: true
        }
      },
      privacy: {
        analyticsEnabled: true,
        crashReportingEnabled: true,
        dataSharingEnabled: false,
        profileVisibility: 'team' as const,
        activityLogging: true
      },
      workspace: {
        defaultExportFormat: 'coco' as const,
        autoSaveInterval: 30,
        keyboardShortcuts: true,
        showTutorials: false,
        gridSnapping: true,
        darkModeAnnotations: true
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium' as const,
        screenReader: false,
        keyboardNavigation: true,
        colorBlindMode: 'none' as const
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    emailVerified: true,
    twoFactorEnabled: false
  }
];

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  plan: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const accessToken = request.cookies.get('accessToken')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET, {
        issuer: 'annotateai',
        audience: 'annotateai-client'
      }) as JWTPayload;
    } catch (error) {
      console.warn('Invalid token in /me endpoint:', error);
      
      // Clear invalid cookies
      const response = NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0
      };

      response.cookies.set('accessToken', '', cookieOptions);
      response.cookies.set('refreshToken', '', cookieOptions);
      response.cookies.set('userInfo', '', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0
      });

      return response;
    }

    // Find user in database
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if account is active
    if (user.subscription.status !== 'active' && user.subscription.status !== 'trialing') {
      return NextResponse.json(
        { 
          error: 'Account suspended',
          code: 'ACCOUNT_SUSPENDED',
          details: {
            status: user.subscription.status,
            reason: 'Subscription is not active'
          }
        },
        { status: 403 }
      );
    }

    // Update last login time (in production, update database)
    user.lastLoginAt = new Date();

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Log access for security monitoring
    console.log('User info accessed:', {
      userId: user.id,
      email: user.email,
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      user: userWithoutPassword,
      authenticated: true,
      tokenValid: true
    });

  } catch (error) {
    console.error('Me API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle POST requests (some clients might send POST)
export async function POST(request: NextRequest) {
  // Redirect POST requests to GET
  return GET(request);
}

// Handle PATCH requests for updating user profile
export async function PATCH(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const accessToken = request.cookies.get('accessToken')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET, {
        issuer: 'annotateai',
        audience: 'annotateai-client'
      }) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }

    // Find user in database
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse update data
    const updateData = await request.json();
    
    // Validate allowed fields
    const allowedFields = ['firstName', 'lastName', 'avatar', 'preferences'];
    const updates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    // Validate specific field types
    if (updates.firstName && typeof updates.firstName !== 'string') {
      return NextResponse.json(
        { 
          error: 'First name must be a string',
          code: 'VALIDATION_ERROR',
          field: 'firstName'
        },
        { status: 400 }
      );
    }

    if (updates.lastName && typeof updates.lastName !== 'string') {
      return NextResponse.json(
        { 
          error: 'Last name must be a string',
          code: 'VALIDATION_ERROR',
          field: 'lastName'
        },
        { status: 400 }
      );
    }

    // Apply updates
    Object.assign(user, updates);
    user.updatedAt = new Date();

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Log profile update
    console.log('User profile updated:', {
      userId: user.id,
      email: user.email,
      updatedFields: Object.keys(updates),
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS || 'https://annotateai.com'
        : '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
} 