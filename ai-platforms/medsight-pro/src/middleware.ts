/**
 * Next.js Middleware for Medical Authentication
 * Route protection and access control for medical professionals
 */

import { NextRequest, NextResponse } from 'next/server';
import { medicalServices } from '@/config/shared-config';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/workspace',
  '/admin',
  '/medical',
  '/reports',
  '/profile',
  '/settings'
];

// Admin routes that require admin permissions
const ADMIN_ROUTES = [
  '/admin',
  '/dashboard/admin',
  '/dashboard/enterprise',
  '/dashboard/analytics'
];

// Emergency routes that require emergency access
const EMERGENCY_ROUTES = [
  '/emergency'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/reset-password',
  '/verify-account',
  '/mfa',
  '/license-verification',
  '/organization-invite',
  '/profile-setup',
  '/compliance',
  '/forgot-username',
  '/api/auth'
];

// API routes that need special handling
const API_ROUTES = [
  '/api/auth',
  '/api/medical',
  '/api/admin',
  '/api/emergency'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isEmergencyRoute = EMERGENCY_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isAPIRoute = API_ROUTES.some(route => pathname.startsWith(route));

  // Get authentication token from cookies or headers
  const token = getAuthToken(request);

  // Handle API routes
  if (isAPIRoute) {
    return handleAPIRoute(request, pathname, token);
  }

  // Allow public routes
  if (isPublicRoute) {
    // If user is already authenticated and accessing auth pages, redirect to dashboard
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute && !token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token and get user info
  if (token) {
    const user = await validateToken(token);
    if (!user) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      loginUrl.searchParams.set('reason', 'invalid_token');
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (isAdminRoute) {
      const hasAdminAccess = checkAdminAccess(user, pathname);
      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url));
      }
    }

    // Check emergency routes
    if (isEmergencyRoute) {
      const hasEmergencyAccess = checkEmergencyAccess(user, pathname);
      if (!hasEmergencyAccess) {
        return NextResponse.redirect(new URL('/dashboard?error=emergency_access_denied', request.url));
      }
    }

    // Add user info to headers for server components
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-permissions', JSON.stringify(user.permissions));

    // Medical audit logging
    medicalServices.auditMedicalAccess(user.id, 'route-access', `ROUTE_${pathname.toUpperCase()}`);

    return response;
  }

  // Default to requiring authentication
  if (!isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Get authentication token from request
function getAuthToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const tokenCookie = request.cookies.get('medsight-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

// Validate authentication token
async function validateToken(token: string): Promise<any | null> {
  try {
    // Handle demo tokens
    if (token.startsWith('demo-token-')) {
      console.log('🎭 Demo token detected in middleware');
      return {
        id: 'demo-user-001',
        email: 'testuser@medsightpro.com',
        role: 'physician',
        permissions: ['view-patient-data', 'view-dicom-images', 'generate-reports', 'read_phi', 'write_phi', 'view_analytics'],
        isActive: true,
        sessionValid: true,
        isDemoUser: true
      };
    }

    // In a real implementation, this would:
    // 1. Decode JWT token
    // 2. Verify signature
    // 3. Check expiration
    // 4. Validate against session store
    // 5. Return user info

    // Mock implementation - return user if token is valid format
    if (token.startsWith('jwt-token-') || token.startsWith('token_')) {
      return {
        id: 'user-123',
        email: 'dr.smith@hospital.com',
        role: 'attending',
        permissions: ['view-patient-data', 'view-dicom-images', 'generate-reports'],
        isActive: true,
        sessionValid: true
      };
    }

    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// Check admin access
function checkAdminAccess(user: any, pathname: string): boolean {
  const adminRoles = ['administrator', 'system-admin', 'super-admin'];
  const adminPermissions = ['system-administration', 'manage-users'];

  // Check role-based access
  if (adminRoles.includes(user.role)) {
    return true;
  }

  // Check permission-based access
  if (user.permissions.some((perm: string) => adminPermissions.includes(perm))) {
    return true;
  }

  // Specific route checks
  if (pathname.startsWith('/dashboard/analytics')) {
    return user.permissions.includes('system-administration');
  }

  if (pathname.startsWith('/dashboard/enterprise')) {
    return user.role === 'super-admin';
  }

  return false;
}

// Check emergency access
function checkEmergencyAccess(user: any, pathname: string): boolean {
  const emergencyRoles = ['attending', 'radiologist', 'system-admin', 'super-admin'];
  const emergencyPermissions = ['emergency-access'];

  // Check role-based access
  if (emergencyRoles.includes(user.role)) {
    return true;
  }

  // Check permission-based access
  if (user.permissions.some((perm: string) => emergencyPermissions.includes(perm))) {
    return true;
  }

  return false;
}

// Handle API route middleware
async function handleAPIRoute(request: NextRequest, pathname: string, token: string | null) {
  // Public API routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Protected API routes require authentication
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Validate token for API access
  const user = await validateToken(token);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Check API-specific permissions
  if (pathname.startsWith('/api/admin/')) {
    const hasAdminAccess = checkAdminAccess(user, pathname);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith('/api/emergency/')) {
    const hasEmergencyAccess = checkEmergencyAccess(user, pathname);
    if (!hasEmergencyAccess) {
      return NextResponse.json(
        { error: 'Emergency access required' },
        { status: 403 }
      );
    }
  }

  // Add user context to API requests
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-role', user.role);
  response.headers.set('x-user-permissions', JSON.stringify(user.permissions));

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 