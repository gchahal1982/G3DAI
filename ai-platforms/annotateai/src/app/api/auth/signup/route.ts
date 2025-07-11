import { NextRequest, NextResponse } from 'next/server';
import { SignupRequest, AuthResponse, UserRole, SubscriptionPlan } from '@/types/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple rate limiting store (replace with Redis in production)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

function checkRateLimit(identifier: string): { success: boolean; reset: number; remaining: number } {
  const now = Date.now();
  const maxAttempts = 3; // Lower limit for signup
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

// Mock user database (in production, use a real database)
const mockUsers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.ip || 'anonymous';
    const { success, reset, remaining } = checkRateLimit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: reset
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }

    // Parse and validate request body
    const body: SignupRequest = await request.json();
    
    // Validate required fields
    const validationErrors: Record<string, string> = {};
    
    if (!body.email) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(body.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }

    if (!body.password) {
      validationErrors.password = 'Password is required';
    } else if (body.password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(body.password)) {
      validationErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    if (!body.firstName) {
      validationErrors.firstName = 'First name is required';
    } else if (body.firstName.length < 2) {
      validationErrors.firstName = 'First name must be at least 2 characters long';
    }

    if (!body.lastName) {
      validationErrors.lastName = 'Last name is required';
    } else if (body.lastName.length < 2) {
      validationErrors.lastName = 'Last name must be at least 2 characters long';
    }

    if (!body.acceptTerms) {
      validationErrors.acceptTerms = 'You must accept the terms of service';
    }

    if (!body.acceptPrivacy) {
      validationErrors.acceptPrivacy = 'You must accept the privacy policy';
    }

    // Enterprise plan validation
    if (body.plan === 'enterprise' && !body.organizationName) {
      validationErrors.organizationName = 'Organization name is required for enterprise plans';
    }

    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'An account with this email already exists',
          code: 'USER_EXISTS',
          field: 'email'
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Create new user
    const now = new Date();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newUser = {
      id: userId,
      name: `${body.firstName} ${body.lastName}`,
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      avatar: null,
      role: UserRole.ANNOTATOR,
      subscription: {
        id: `sub_${Date.now()}`,
        plan: body.plan === 'professional' ? SubscriptionPlan.PROFESSIONAL : 
              body.plan === 'enterprise' ? SubscriptionPlan.ENTERPRISE : 
              SubscriptionPlan.FREE,
        status: 'active' as const,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        trialEndsAt: body.plan === 'free' ? undefined : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        usage: {
          projects: 0,
          storage: 0,
          apiCalls: 0,
          annotations: 0,
          teamMembers: 1,
          modelTraining: 0,
          exports: 0
        },
        limits: getPlanLimits(body.plan || 'free')
      },
      organization: body.organizationName ? {
        id: `org_${Date.now()}`,
        name: body.organizationName,
        domain: body.email.split('@')[1], // Extract domain from email
        teamSize: parseInt(body.organizationSize || '1'),
        settings: {
          allowInvites: true,
          requireApproval: false,
          defaultRole: UserRole.ANNOTATOR,
          ssoEnabled: false,
          auditLogging: body.plan === 'enterprise'
        },
        members: [], // Will be populated after user creation
        subscription: {
          id: `sub_${Date.now()}`,
          plan: body.plan === 'professional' ? SubscriptionPlan.PROFESSIONAL : 
                body.plan === 'enterprise' ? SubscriptionPlan.ENTERPRISE : 
                SubscriptionPlan.FREE,
          status: 'active' as const,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
          trialEndsAt: body.plan === 'free' ? undefined : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          usage: {
            projects: 0,
            storage: 0,
            apiCalls: 0,
            annotations: 0,
            teamMembers: 1,
            modelTraining: 0,
            exports: 0
          },
          limits: getPlanLimits(body.plan || 'free')
        },
        createdAt: now,
        updatedAt: now
      } : undefined,
      preferences: {
        theme: 'light' as const,
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: {
            projectUpdates: true,
            teamInvites: true,
            billingAlerts: true,
            securityAlerts: true,
            productUpdates: body.acceptMarketing || false,
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
          showTutorials: true,
          gridSnapping: true,
          darkModeAnnotations: false
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
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      twoFactorEnabled: false
    };

    // Add user to mock database
    mockUsers.push(newUser);

    // Generate JWT tokens
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = 60 * 60; // 1 hour
    
    const accessToken = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.subscription.plan
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
        userId: newUser.id, 
        type: 'refresh' 
      },
      JWT_SECRET,
      { 
        expiresIn: 7 * 24 * 60 * 60, // 7 days
        issuer: 'annotateai',
        audience: 'annotateai-client'
      }
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    // Log successful signup for monitoring
    console.log('Successful signup:', {
      userId: newUser.id,
      email: newUser.email,
      plan: newUser.subscription.plan,
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
    const httpResponse = NextResponse.json(response, { status: 201 });

    // Set secure HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set access token cookie
    httpResponse.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: expiresIn
    });

    // Set refresh token cookie
    httpResponse.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Set user info cookie for client-side access
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
      maxAge: 7 * 24 * 60 * 60
    });

    return httpResponse;

  } catch (error) {
    console.error('Signup API error:', error);
    
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

// Helper function to get plan limits
function getPlanLimits(plan: string) {
  const limits = {
    free: {
      projects: 3,
      storage: 1, // GB
      apiCalls: 1000,
      annotations: 10000,
      teamMembers: 1,
      modelTraining: 0,
      exports: 50,
      supportLevel: 'basic' as const
    },
    pro: {
      projects: 25,
      storage: 50, // GB
      apiCalls: 50000,
      annotations: 500000,
      teamMembers: 10,
      modelTraining: 10,
      exports: 1000,
      supportLevel: 'priority' as const
    },
    enterprise: {
      projects: 'unlimited' as const,
      storage: 'unlimited' as const,
      apiCalls: 'unlimited' as const,
      annotations: 'unlimited' as const,
      teamMembers: 'unlimited' as const,
      modelTraining: 'unlimited' as const,
      exports: 'unlimited' as const,
      supportLevel: 'dedicated' as const
    }
  };

  return limits[plan as keyof typeof limits] || limits.free;
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