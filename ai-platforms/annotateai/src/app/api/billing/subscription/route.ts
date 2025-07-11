import { NextRequest, NextResponse } from 'next/server';
import { 
  getBillingInfo, 
  updateSubscription, 
  cancelSubscription,
  createCheckoutSession,
  PRICING_PLANS 
} from '@/lib/billing/stripe';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/auth
    // For now, using mock data - replace with actual user data
    const userId = 'user_123';
    const customerId = 'cus_123';
    
    // Mock current usage - replace with actual usage tracking
    const currentUsage = {
      annotations: 5432,
      aiInference: 234,
      storage: 2.5 * 1024 * 1024 * 1024, // 2.5GB in bytes
      projects: 7,
      teamMembers: 2,
    };

    // Get billing information
    const billingInfo = await getBillingInfo(customerId, currentUsage);
    
    const subscriptionData = {
      currentPlan: billingInfo.plan.name,
      planPrice: billingInfo.plan.price,
      billingCycle: billingInfo.subscription?.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
      nextBillingDate: billingInfo.subscription?.current_period_end ? 
        new Date(billingInfo.subscription.current_period_end * 1000).toISOString() : 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionStatus: billingInfo.subscription?.status || 'active',
      canUpgrade: billingInfo.plan.id !== 'enterprise',
      canDowngrade: billingInfo.plan.id !== 'free',
    };

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, planId, billingCycle } = await request.json();
    
    // TODO: Get user from session/auth
    const userId = 'user_123';
    const customerId = 'cus_123';
    
    switch (action) {
      case 'change_plan':
        return await handlePlanChange(customerId, planId, billingCycle);
      case 'update_billing_cycle':
        return await handleBillingCycleUpdate(customerId, billingCycle);
      case 'reactivate':
        return await handleReactivateSubscription(customerId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing subscription action:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription action' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { immediately = false } = await request.json().catch(() => ({}));
    
    // TODO: Get user from session/auth and subscription ID
    const userId = 'user_123';
    const subscriptionId = 'sub_123';
    
    // Cancel the subscription
    const subscription = await cancelSubscription(subscriptionId, immediately);
    
    return NextResponse.json({
      success: true,
      message: immediately ? 'Subscription cancelled immediately' : 'Subscription will cancel at period end',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAt: subscription.cancel_at,
        canceledAt: subscription.canceled_at,
        currentPeriodEnd: subscription.current_period_end,
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

async function handlePlanChange(customerId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
  try {
    const plan = PRICING_PLANS[planId.toUpperCase() as keyof typeof PRICING_PLANS];
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    if (planId === 'free') {
      // Downgrade to free - cancel current subscription
      // TODO: Get actual subscription ID
      const subscriptionId = 'sub_123';
      const subscription = await cancelSubscription(subscriptionId, false);
      
      return NextResponse.json({
        success: true,
        message: 'Downgraded to free plan. Access will continue until your current period ends.',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAt: subscription.cancel_at,
        }
      });
    }

    // For paid plans, create checkout session
    if (!plan.stripePriceId) {
      throw new Error('Plan price ID not configured');
    }

    const checkout = await createCheckoutSession({
      priceId: plan.stripePriceId,
      customerId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
      trialDays: planId === 'starter' ? 14 : 0,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    throw error;
  }
}

async function handleBillingCycleUpdate(customerId: string, billingCycle: 'monthly' | 'yearly') {
  try {
    // TODO: Implement billing cycle change
    // This would typically involve:
    // 1. Get current subscription
    // 2. Create new subscription with different billing cycle
    // 3. Cancel old subscription
    // 4. Handle proration
    
    return NextResponse.json({
      success: true,
      message: 'Billing cycle update initiated',
    });
  } catch (error) {
    console.error('Error updating billing cycle:', error);
    throw error;
  }
}

async function handleReactivateSubscription(customerId: string) {
  try {
    // TODO: Get actual subscription ID
    const subscriptionId = 'sub_123';
    
    // Reactivate subscription by removing cancel_at_period_end
    const subscription = await updateSubscription(subscriptionId, {
      cancel_at_period_end: false,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAt: subscription.cancel_at,
      }
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
} 