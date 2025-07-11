import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In production, you'd want to maintain a blacklist of tokens in Redis or database
const tokenBlacklist = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies or Authorization header
    const accessToken = request.cookies.get('accessToken')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '');
    
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Verify and decode the access token to get user info for logging
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (accessToken) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(accessToken, JWT_SECRET) as any;
        userId = decoded.userId;
        userEmail = decoded.email;
        
        // Add token to blacklist (in production, use Redis with expiration)
        tokenBlacklist.add(accessToken);
      } catch (error) {
        // Token might be expired or invalid, that's okay for logout
        console.warn('Invalid token during logout:', error);
      }
    }

    if (refreshToken) {
      try {
        // Also blacklist the refresh token
        tokenBlacklist.add(refreshToken);
      } catch (error) {
        console.warn('Error blacklisting refresh token:', error);
      }
    }

    // Log successful logout for security monitoring
    console.log('User logout:', {
      userId: userId || 'unknown',
      email: userEmail || 'unknown',
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    // Create response
    const response = NextResponse.json(
      { 
        message: 'Successfully logged out',
        success: true 
      }, 
      { status: 200 }
    );

    // Clear all authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0 // Expire immediately
    };

    // Clear access token cookie
    response.cookies.set('accessToken', '', cookieOptions);

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', cookieOptions);

    // Clear user info cookie
    response.cookies.set('userInfo', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0
    });

    // Additional security: clear any other potential auth-related cookies
    response.cookies.set('session', '', cookieOptions);
    response.cookies.set('auth', '', cookieOptions);

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, we should still clear cookies and return success
    // because the user is trying to log out
    const response = NextResponse.json(
      { 
        message: 'Logged out (with errors)',
        success: true 
      }, 
      { status: 200 }
    );

    // Clear cookies even in error case
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
}

// Handle GET requests (some clients might send GET for logout)
export async function GET(request: NextRequest) {
  // Redirect GET requests to POST for security
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST for logout.',
      message: 'Please use POST method to logout.'
    },
    { status: 405 }
  );
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

// Utility function to check if a token is blacklisted
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Utility function to clean expired tokens from blacklist
// In production, this would be handled by Redis TTL
export function cleanExpiredTokens() {
  // This is a simple implementation
  // In production, you'd use Redis with automatic expiration
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  for (const token of tokenBlacklist) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token is expired or invalid, remove from blacklist
      tokenBlacklist.delete(token);
    }
  }
}

// Clean expired tokens periodically (in production, use a cron job)
if (typeof window === 'undefined') {
  setInterval(cleanExpiredTokens, 60 * 60 * 1000); // Every hour
} 