import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getResetToken, markTokenAsUsed, cleanupExpiredTokens } from '../../../../lib/auth/reset-tokens';

// Mock user database (should match other auth endpoints)
let users = [
  {
    id: '1',
    email: 'demo@annotateai.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Demo',
    lastName: 'User',
    plan: 'professional' as const,
    organizationId: 'org-1',
    organizationName: 'Demo Organization',
    role: 'admin' as const,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-01T00:00:00Z',
    isEmailVerified: true,
    preferences: {
      theme: 'dark' as const,
      language: 'en',
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
    },
  },
];

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { message: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = getResetToken(token);
    
    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find(u => u.id === resetToken.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    user.password = hashedPassword;
    user.lastLoginAt = new Date().toISOString(); // Update last activity

    // Mark token as used
    markTokenAsUsed(token);

    // TODO: Invalidate all existing sessions for this user
    // await invalidateUserSessions(user.id);

    // TODO: Send password change confirmation email
    // await sendPasswordChangeConfirmation({
    //   email: user.email,
    //   firstName: user.firstName,
    //   timestamp: new Date().toISOString()
    // });

    // TODO: Log security event
    // await logSecurityEvent({
    //   userId: user.id,
    //   event: 'password_reset',
    //   timestamp: new Date().toISOString(),
    //   metadata: {
    //     tokenUsed: token,
    //     userAgent: request.headers.get('user-agent'),
    //     ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    //   }
    // });

    console.log('Password reset successful for user:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint to validate reset token (used by frontend)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = getResetToken(token);
    
    if (!resetToken) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.email, // Can be used to show which email the reset is for
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions are now available from the reset-tokens utility module 