import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/models',
  '/analytics',
  '/profile',
  '/settings',
];

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/pricing',
  '/docs',
  '/help',
  '/status',
  '/legal',
  '/api',
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get('auth_token')?.value || 
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // Verify token if present
  let user = null;
  if (token) {
    user = await verifyToken(token);
  }

  const isAuthenticated = !!user;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Add user info to headers for server components (optional)
  if (isAuthenticated && user) {
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId as string);
    response.headers.set('x-user-email', user.email as string);
    response.headers.set('x-user-role', user.role as string);
    return response;
  }

  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 