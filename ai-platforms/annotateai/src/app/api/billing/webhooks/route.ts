import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/billing/stripe';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error('Missing webhook endpoint secret');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  try {
    // TODO: Update user subscription status in database
    // TODO: Send welcome email
    // TODO: Track conversion analytics
    
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    
    console.log(`Customer ${customerId} completed checkout for subscription ${subscriptionId}`);
    
    // Here you would typically:
    // 1. Update user record with subscription ID
    // 2. Grant access to paid features
    // 3. Send confirmation email
    // 4. Track analytics event
    
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    
    // TODO: Update user subscription in database
    // TODO: Enable features based on plan
    // TODO: Send activation email
    
    console.log(`Subscription ${subscription.id} created for customer ${customerId} with price ${priceId}`);
    
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    // TODO: Update subscription status in database
    // TODO: Handle plan changes
    // TODO: Update feature access
    
    console.log(`Subscription ${subscription.id} updated for customer ${customerId} - Status: ${status}`);
    
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    
    // TODO: Update user to free plan
    // TODO: Disable premium features
    // TODO: Send cancellation email
    // TODO: Schedule data retention cleanup
    
    console.log(`Subscription ${subscription.id} cancelled for customer ${customerId}`);
    
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;
    const amountPaid = invoice.amount_paid;
    
    // TODO: Send payment confirmation email
    // TODO: Update payment history
    // TODO: Track revenue analytics
    
    console.log(`Payment of $${amountPaid / 100} succeeded for customer ${customerId}`);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;
    const attemptCount = invoice.attempt_count;
    
    // TODO: Send payment failure notification
    // TODO: Implement retry logic
    // TODO: Handle dunning management
    
    console.log(`Payment failed for customer ${customerId}, attempt ${attemptCount}`);
    
    // If this is the final attempt, consider downgrading or suspending access
    if (attemptCount >= 3) {
      console.log(`Final payment attempt failed for customer ${customerId}`);
      // TODO: Suspend account or downgrade to free plan
    }
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);
  
  try {
    // TODO: Update user record with Stripe customer ID
    // TODO: Set up analytics tracking
    
    console.log(`Customer created: ${customer.id} - Email: ${customer.email}`);
    
  } catch (error) {
    console.error('Error handling customer creation:', error);
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id);
  
  try {
    // TODO: Sync customer data changes
    // TODO: Update user profile if needed
    
    console.log(`Customer updated: ${customer.id}`);
    
  } catch (error) {
    console.error('Error handling customer update:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method attached:', paymentMethod.id);
  
  try {
    const customerId = paymentMethod.customer as string;
    
    // TODO: Update payment methods cache
    // TODO: Send confirmation email if this is the first payment method
    
    console.log(`Payment method ${paymentMethod.id} attached to customer ${customerId}`);
    
  } catch (error) {
    console.error('Error handling payment method attachment:', error);
  }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method detached:', paymentMethod.id);
  
  try {
    // TODO: Update payment methods cache
    // TODO: Notify if this was the last payment method
    
    console.log(`Payment method ${paymentMethod.id} detached`);
    
  } catch (error) {
    console.error('Error handling payment method detachment:', error);
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 