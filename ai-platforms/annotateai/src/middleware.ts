import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup', 
  '/auth/forgot-password',
  '/auth/reset-password',
  '/pricing',
  '/docs',
  '/help',
  '/status',
  '/legal',
  '/legal/privacy',
  '/legal/terms',
  '/onboarding',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/health',
  '/api/status',
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/datasets',
  '/models',
  '/analytics',
  '/profile',
  '/settings',
  '/api/projects',
  '/api/users',
  '/api/billing',
  '/api/upload',
  '/api/ai',
  '/api/search',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/videos/') ||
    pathname.startsWith('/icons/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = getTokenFromRequest(request);

  if (!token) {
    // Redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload as any;

    // Check for admin routes
    if (isAdminRoute(pathname) && user.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);
    
    if (user.organizationId) {
      requestHeaders.set('x-organization-id', user.organizationId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // Token is invalid, redirect to login
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookie
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true;
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return false;
  });
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (pathname.startsWith(route)) return true;
    return false;
  });
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => {
    if (pathname.startsWith(route)) return true;
    return false;
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};