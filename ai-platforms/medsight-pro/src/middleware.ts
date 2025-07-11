/**
 * MedSight Pro - Next.js Middleware
 * Authentication protection and route-based access control for medical professionals
 * HIPAA-compliant session validation and medical workflow protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { MEDICAL_NAVIGATION_CONFIG, MedicalNavigationManager } from '@/lib/navigation';

// Medical middleware configuration
const MEDICAL_MIDDLEWARE_CONFIG = {
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/verify-account',
    '/mfa',
    '/license-verification',
    '/organization-invite',
    '/profile-setup',
    '/compliance',
    '/forgot-username'
  ],
  
  // Routes that require authentication but have basic access
  protectedRoutes: [
    '/dashboard',
    '/workspace',
    '/profile',
    '/settings'
  ],
  
  // Admin routes that require elevated permissions
  adminRoutes: [
    '/admin',
    '/dashboard/admin',
    '/dashboard/enterprise'
  ],
  
  // Emergency routes with special handling
  emergencyRoutes: [
    '/emergency'
  ],
  
  // API routes that need protection
  apiRoutes: [
    '/api/medical',
    '/api/admin',
    '/api/emergency'
  ]
};

// Medical session validation
async function validateMedicalSession(request: NextRequest): Promise<{
  valid: boolean;
  user?: any;
  redirectPath?: string;
}> {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('medical_session_token')?.value;
    if (!sessionToken) {
      return { valid: false, redirectPath: '/login' };
    }

    // Get session ID from storage (would be validated against server in production)
    const sessionId = request.cookies.get('medical_session_id')?.value;
    if (!sessionId) {
      return { valid: false, redirectPath: '/login' };
    }

    // Mock session validation (in production, validate against secure session store)
    const mockUser = {
      id: 'user_123',
      email: 'dr.sarah.chen@hospital.com',
      name: 'Dr. Sarah Chen',
      roles: ['radiologist', 'attending'],
      medicalLicense: 'MD-CA-12345',
      mfaVerified: true,
      complianceStatus: {
        hipaaValid: true,
        licenseValid: true,
        backgroundValid: true
      },
      sessionInfo: {
        lastActivity: new Date(),
        sessionTimeout: 15 * 60 * 1000, // 15 minutes
        deviceFingerprint: 'mock_fingerprint'
      }
    };

    // Check session timeout (in production, this would be server-side validation)
    const sessionAge = Date.now() - new Date(mockUser.sessionInfo.lastActivity).getTime();
    if (sessionAge > mockUser.sessionInfo.sessionTimeout) {
      return { valid: false, redirectPath: '/login?session=expired' };
    }

    return { valid: true, user: mockUser };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, redirectPath: '/login?error=session_error' };
  }
}

// Route access validation
function validateRouteAccess(pathname: string, user: any): {
  allowed: boolean;
  redirectPath?: string;
  reason?: string;
} {
  // Find matching route in navigation config
  const route = MedicalNavigationManager.findRouteByPath(MEDICAL_NAVIGATION_CONFIG, pathname);
  
  if (route) {
    // Use navigation manager to validate access
    const accessValidation = MedicalNavigationManager.validateRouteAccess(route, user);
    
    if (!accessValidation.allowed) {
      return {
        allowed: false,
        redirectPath: '/dashboard/medical',
        reason: accessValidation.reasons.join(', ')
      };
    }
  }

  // Check route categories
  if (isAdminRoute(pathname)) {
    const hasAdminRole = user.roles.some((role: string) => 
      ['admin', 'system_admin'].includes(role)
    );
    
    if (!hasAdminRole) {
      return {
        allowed: false,
        redirectPath: '/dashboard/medical',
        reason: 'Admin access required'
      };
    }
  }

  if (isEmergencyRoute(pathname)) {
    const hasEmergencyAccess = user.roles.some((role: string) => 
      ['radiologist', 'attending', 'medical_professional'].includes(role)
    );
    
    if (!hasEmergencyAccess) {
      return {
        allowed: false,
        redirectPath: '/dashboard/medical',
        reason: 'Emergency access not permitted for this role'
      };
    }
  }

  return { allowed: true };
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return MEDICAL_MIDDLEWARE_CONFIG.publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Check if route requires authentication
function isProtectedRoute(pathname: string): boolean {
  return MEDICAL_MIDDLEWARE_CONFIG.protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
}

// Check if route requires admin access
function isAdminRoute(pathname: string): boolean {
  return MEDICAL_MIDDLEWARE_CONFIG.adminRoutes.some(route => 
    pathname.startsWith(route)
  );
}

// Check if route is emergency access
function isEmergencyRoute(pathname: string): boolean {
  return MEDICAL_MIDDLEWARE_CONFIG.emergencyRoutes.some(route => 
    pathname.startsWith(route)
  );
}

// Check if route is API endpoint
function isAPIRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

// Handle API route protection
async function handleAPIRoute(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  
  // Public API routes
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/public/')) {
    return NextResponse.next();
  }

  // Validate session for protected API routes
  const sessionValidation = await validateMedicalSession(request);
  if (!sessionValidation.valid) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  // Validate API route access
  const routeAccess = validateRouteAccess(pathname, sessionValidation.user);
  if (!routeAccess.allowed) {
    return NextResponse.json(
      { error: 'Access denied', reason: routeAccess.reason, code: 'ACCESS_DENIED' },
      { status: 403 }
    );
  }

  // Add user context to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-medical-user-id', sessionValidation.user.id);
  requestHeaders.set('x-medical-user-email', sessionValidation.user.email);
  requestHeaders.set('x-medical-user-roles', JSON.stringify(sessionValidation.user.roles));
  requestHeaders.set('x-medical-license', sessionValidation.user.medicalLicense);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

// Handle page route protection
async function handlePageRoute(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Validate session for protected routes
  const sessionValidation = await validateMedicalSession(request);
  if (!sessionValidation.valid) {
    const redirectUrl = new URL(sessionValidation.redirectPath || '/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Validate route access
  const routeAccess = validateRouteAccess(pathname, sessionValidation.user);
  if (!routeAccess.allowed) {
    const redirectUrl = new URL(routeAccess.redirectPath || '/dashboard/medical', request.url);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('reason', routeAccess.reason || 'Insufficient permissions');
    return NextResponse.redirect(redirectUrl);
  }

  // Add security headers for medical applications
  const response = NextResponse.next();
  
  // HIPAA compliance headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Medical session headers
  response.headers.set('X-Medical-Session-Valid', 'true');
  response.headers.set('X-Medical-User-Roles', JSON.stringify(sessionValidation.user.roles));
  
  // Cache control for medical data
  if (pathname.includes('/patient/') || pathname.includes('/study/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Log access attempts for audit trail
function logAccessAttempt(request: NextRequest, result: string, user?: any): void {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action: 'route_access',
    pathname: request.nextUrl.pathname,
    method: request.method,
    result,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userId: user?.id || 'anonymous',
    userEmail: user?.email || 'anonymous',
    medicalLicense: user?.medicalLicense || 'none'
  };
  
  console.log('🔍 Medical Access Audit:', auditLog);
  
  // In production, send to secure audit logging service
  // await sendToAuditService(auditLog);
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  try {
    // Handle API routes
    if (isAPIRoute(pathname)) {
      const result = await handleAPIRoute(request);
      logAccessAttempt(request, 'api_access', null);
      return result;
    }

    // Handle page routes
    const result = await handlePageRoute(request);
    
    // Log access attempt
    const sessionValidation = await validateMedicalSession(request);
    logAccessAttempt(
      request, 
      sessionValidation.valid ? 'page_access_granted' : 'page_access_denied',
      sessionValidation.user
    );
    
    return result;
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Log error
    logAccessAttempt(request, 'middleware_error', null);
    
    // Redirect to error page for non-API routes
    if (!isAPIRoute(pathname)) {
      return NextResponse.redirect(new URL('/login?error=system_error', request.url));
    }
    
    // Return error response for API routes
    return NextResponse.json(
      { error: 'System error', code: 'SYSTEM_ERROR' },
      { status: 500 }
    );
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 