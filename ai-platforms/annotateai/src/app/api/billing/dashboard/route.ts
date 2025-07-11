import { NextRequest, NextResponse } from 'next/server';
import { getBillingInfo, getInvoices, PRICING_PLANS } from '@/lib/billing/stripe';

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
    
    // Get payment history
    const invoices = await getInvoices(customerId, 20);
    
    const paymentHistory = invoices.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: (invoice.amount_paid || 0) / 100, // Convert from cents
      status: invoice.status === 'paid' ? 'paid' : 
              invoice.status === 'draft' ? 'pending' : 'failed',
      description: invoice.description || `${billingInfo.plan.name} Plan`,
      invoiceUrl: invoice.invoice_pdf || undefined,
    }));

    // Format response data
    const response = {
      billingInfo: {
        currentPlan: billingInfo.plan.name,
        planPrice: billingInfo.plan.price,
        billingCycle: billingInfo.subscription?.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
        nextBillingDate: billingInfo.subscription?.current_period_end ? 
          new Date(billingInfo.subscription.current_period_end * 1000).toISOString() : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as fallback
        subscriptionStatus: billingInfo.subscription?.status || 'active',
        usageStats: {
          annotationsCount: currentUsage.annotations,
          storageUsed: currentUsage.storage,
          apiCallsCount: currentUsage.aiInference,
          collaboratorsCount: currentUsage.teamMembers,
        },
        planLimits: {
          annotations: typeof (billingInfo.plan.features as any).annotations === 'string' && (billingInfo.plan.features as any).annotations === 'Unlimited' ? -1 : (billingInfo.plan.features as any).annotations,
          storage: (() => {
            const storageStr = (billingInfo.plan.features as any).storage as string;
            if (storageStr === 'Unlimited') return -1;
            const match = storageStr.match(/(\d+)(\w+)/);
            if (!match) return 0;
            const [, num, unit] = match;
            const multiplier = unit === 'TB' ? 1024 * 1024 * 1024 * 1024 : 
                             unit === 'GB' ? 1024 * 1024 * 1024 : 
                             unit === 'MB' ? 1024 * 1024 : 1024;
            return parseInt(num) * multiplier;
          })(),
          apiCalls: typeof (billingInfo.plan.features as any).aiInference === 'string' && (billingInfo.plan.features as any).aiInference === 'Unlimited' ? -1 : (billingInfo.plan.features as any).aiInference,
          collaborators: typeof (billingInfo.plan.features as any).teamMembers === 'string' && (billingInfo.plan.features as any).teamMembers === 'Unlimited' ? -1 : (billingInfo.plan.features as any).teamMembers,
        },
      },
      paymentHistory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching billing dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // TODO: Implement specific billing actions
    // - update_subscription
    // - change_plan
    // - cancel_subscription
    // - update_payment_method
    
    switch (action) {
      case 'update_subscription':
        // Handle subscription updates
        break;
      case 'change_plan':
        // Handle plan changes
        break;
      case 'cancel_subscription':
        // Handle subscription cancellation
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing billing action:', error);
    return NextResponse.json(
      { error: 'Failed to process billing action' },
      { status: 500 }
    );
  }
} 