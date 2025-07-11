import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRICING_PLANS } from '@/lib/billing/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      priceId, 
      customerId, 
      customerEmail, 
      successUrl, 
      cancelUrl, 
      trialDays, 
      metadata = {} 
    } = body;

    // Validation
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!customerId && !customerEmail) {
      return NextResponse.json(
        { error: 'Either customer ID or email is required' },
        { status: 400 }
      );
    }

    // Validate price ID exists in our plans
    const planExists = Object.values(PRICING_PLANS).some(
      plan => plan.stripePriceId === priceId
    );

    if (!planExists) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      customerId,
      customerEmail,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      trialDays,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
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