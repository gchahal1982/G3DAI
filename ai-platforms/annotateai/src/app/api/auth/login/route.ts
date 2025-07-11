import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, AuthResponse, UserRole, SubscriptionPlan } from '@/types/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Temporary mock user database (replace with actual database)
const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@annotateai.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Demo',
    lastName: 'User',
    avatar: null,
    role: UserRole.ADMIN,
    subscription: {
      id: 'sub-1',
      plan: SubscriptionPlan.PROFESSIONAL,
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
        supportLevel: 'priority' as const
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
        browser: true,
        mobile: true,
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

// Simple rate limiting store (replace with Redis in production)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

function checkRateLimit(identifier: string): { success: boolean; reset: number; remaining: number } {
  const now = Date.now();
  const maxAttempts = 5;
  const windowMs = 60 * 1000; // 1 minute
  
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { attempts: 1, resetTime: now + windowMs });
    return { success: true, reset: now + windowMs, remaining: maxAttempts - 1 };
  }
  
  if (record.attempts >= maxAttempts) {
    return { success: false, reset: record.resetTime, remaining: 0 };
  }
  
  record.attempts++;
  rateLimitStore.set(identifier, record);
  return { success: true, reset: record.resetTime, remaining: maxAttempts - record.attempts };
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip || 'anonymous';
    const { success, reset, remaining } = checkRateLimit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: reset
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }

    // Parse and validate request body
    const body: LoginRequest = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR',
          details: {
            email: !body.email ? 'Email is required' : undefined,
            password: !body.password ? 'Password is required' : undefined
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          error: 'Please enter a valid email address',
          code: 'VALIDATION_ERROR',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase().trim());
    
    if (!user) {
      // Log failed attempt for security monitoring
      console.warn('Failed login attempt:', {
        email: body.email,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        reason: 'User not found'
      });

      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'AUTHENTICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Verify password
    let isValidPassword = false;
    
    // Special case for demo user
    if (user.email === 'demo@annotateai.com' && body.password === 'demo123') {
      isValidPassword = true;
    } else {
      isValidPassword = await bcrypt.compare(body.password, user.password);
    }
    
    if (!isValidPassword) {
      // Log failed attempt for security monitoring
      console.warn('Failed login attempt:', {
        email: body.email,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        reason: 'Invalid password'
      });

      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'AUTHENTICATION_FAILED'
        },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = body.rememberMe ? 30 * 24 * 60 * 60 : 60 * 60; // 30 days or 1 hour
    
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        plan: user.subscription.plan
      },
      JWT_SECRET,
      { 
        expiresIn: expiresIn,
        issuer: 'annotateai',
        audience: 'annotateai-client'
      }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        type: 'refresh' 
      },
      JWT_SECRET,
      { 
        expiresIn: body.rememberMe ? 90 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 90 days or 7 days
        issuer: 'annotateai',
        audience: 'annotateai-client'
      }
    );

    // Update last login (in real app, update database)
    user.lastLoginAt = new Date();

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    // Log successful login for security monitoring
    console.log('Successful login:', {
      userId: userWithoutPassword.id,
      email: userWithoutPassword.email,
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Prepare response
    const response: AuthResponse = {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    };

    // Create HTTP response with secure cookies
    const httpResponse = NextResponse.json(response, { status: 200 });

    // Set secure HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set access token cookie (shorter expiry)
    httpResponse.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: expiresIn
    });

    // Set refresh token cookie (longer expiry if remember me is enabled)
    const refreshTokenMaxAge = body.rememberMe 
      ? 30 * 24 * 60 * 60 // 30 days
      : 7 * 24 * 60 * 60; // 7 days

    httpResponse.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge
    });

    // Set user info cookie for client-side access (not sensitive data)
    httpResponse.cookies.set('userInfo', JSON.stringify({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      firstName: userWithoutPassword.firstName,
      lastName: userWithoutPassword.lastName,
      role: userWithoutPassword.role,
      plan: userWithoutPassword.subscription.plan
    }), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: refreshTokenMaxAge
    });

    return httpResponse;

  } catch (error) {
    console.error('Login API error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

// Utility function for rate limiting (if not already available)
async function rateLimit(options: {
  interval: number;
  uniqueTokenPerInterval: number;
  maxAttempts: number;
}) {
  // This would typically use Redis or a similar store
  // For now, return success to avoid breaking the flow
  return {
    success: true,
    reset: Date.now() + options.interval,
    remaining: options.maxAttempts - 1
  };
} 