import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock user database (should match signup/login)
const users = [
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

// Mock reset token storage (replace with Redis or database)
interface ResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

let resetTokens: ResetToken[] = [];

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // For security, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log('Password reset requested for non-existent email:', email);
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    // Check for existing unused reset token
    const existingToken = resetTokens.find(
      token => token.userId === user.id && 
               !token.used && 
               token.expiresAt > new Date()
    );

    let resetToken: string;
    
    if (existingToken) {
      // Use existing valid token
      resetToken = existingToken.token;
      console.log('Reusing existing reset token for user:', user.email);
    } else {
      // Create new reset token
      resetToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const tokenRecord: ResetToken = {
        token: resetToken,
        userId: user.id,
        email: user.email,
        expiresAt,
        createdAt: new Date(),
        used: false,
      };

      resetTokens.push(tokenRecord);
      console.log('Created new reset token for user:', user.email);
    }

    // TODO: Send password reset email
    // await sendPasswordResetEmail({
    //   email: user.email,
    //   firstName: user.firstName,
    //   resetToken,
    //   resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    // });

    // For development, log the reset URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset URL:', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    }

    // Rate limiting: Clean up old tokens (in production, use proper rate limiting)
    const userTokenCount = resetTokens.filter(
      token => token.email === user.email && 
               token.createdAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    ).length;

    if (userTokenCount > 5) {
      console.warn('Rate limit: Too many reset requests for email:', user.email);
      return NextResponse.json(
        { message: 'Too many reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to clean up expired tokens (call periodically)
export function cleanupExpiredTokens() {
  const now = new Date();
  resetTokens = resetTokens.filter(token => token.expiresAt > now);
}

// Export reset tokens for use in reset password endpoint
export { resetTokens }; 