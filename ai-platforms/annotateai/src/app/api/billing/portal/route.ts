import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/billing/stripe';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db/queries';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('auth_token')?.value;
    
    let token = '';
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    // Get user to find Stripe customer ID
    const user = await db.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a Stripe customer ID
    // Note: This would need to be added to the User schema
    // const stripeCustomerId = user.stripeCustomerId;
    
    // For now, create a customer if they don't have one
    let stripeCustomerId: string;
    
    // In production, check if user.stripeCustomerId exists
    // if (!stripeCustomerId) {
      const customer = await stripeService.createCustomer(user);
      stripeCustomerId = customer.id;
    // }

    const { returnUrl } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3021';
    
    // Create customer portal session
    const portalSession = await stripeService.createCustomerPortalSession(
      stripeCustomerId,
      returnUrl || `${baseUrl}/settings/billing`
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url
    });

  } catch (error) {
    console.error('Customer portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 