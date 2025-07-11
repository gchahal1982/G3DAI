/**
 * Stripe Integration for AnnotateAI Platform
 * 
 * Handles subscription management, usage tracking, and billing operations.
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export type PlanId = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number;
  stripePriceId: string;
  features: {
    projects: number | 'unlimited';
    annotations: number | 'unlimited';
    storage: string;
    teamMembers: number | 'unlimited';
    exportFormats: string[];
    aiInference: number | 'unlimited';
    priority: boolean;
    customModels: boolean;
    sso: boolean;
  };
}

export const PRICING_PLANS: Record<PlanId, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: '',
    features: {
      projects: 3,
      annotations: 1000,
      storage: '1GB',
      teamMembers: 1,
      exportFormats: ['JSON', 'CSV'],
      aiInference: 100,
      priority: false,
      customModels: false,
      sso: false
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: {
      projects: 10,
      annotations: 10000,
      storage: '10GB',
      teamMembers: 5,
      exportFormats: ['JSON', 'CSV', 'COCO', 'YOLO'],
      aiInference: 1000,
      priority: false,
      customModels: false,
      sso: false
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    features: {
      projects: 'unlimited',
      annotations: 'unlimited',
      storage: '100GB',
      teamMembers: 25,
      exportFormats: ['JSON', 'CSV', 'COCO', 'YOLO', 'Pascal VOC'],
      aiInference: 'unlimited',
      priority: true,
      customModels: true,
      sso: false
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: {
      projects: 'unlimited',
      annotations: 'unlimited',
      storage: '1TB',
      teamMembers: 'unlimited',
      exportFormats: ['JSON', 'CSV', 'COCO', 'YOLO', 'Pascal VOC', 'TensorFlow', 'PyTorch'],
      aiInference: 'unlimited',
      priority: true,
      customModels: true,
      sso: true
    }
  }
};

// Stripe service functions
export const stripeService = {
  // Create customer
  createCustomer: async (emailOrUser: string | any, name?: string): Promise<Stripe.Customer> => {
    if (typeof emailOrUser === 'string') {
      return await stripe.customers.create({
        email: emailOrUser,
        name
      });
    } else {
      // Handle User object
      const user = emailOrUser;
      return await stripe.customers.create({
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`
      });
    }
  },

  // Get customer
  getCustomer: async (customerId: string): Promise<Stripe.Customer> => {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  },

  // Create subscription
  createSubscription: async (customerId: string, priceId: string): Promise<Stripe.Subscription> => {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'customer']
    });
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, priceIdOrOptions: string | any): Promise<Stripe.Subscription> => {
    if (typeof priceIdOrOptions === 'string') {
      // Handle legacy string parameter
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceIdOrOptions
          }
        ]
      });
    } else {
      // Handle options object
      return await stripe.subscriptions.update(subscriptionId, priceIdOrOptions);
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> => {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }
  },

  // Get invoices
  getInvoices: async (customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> => {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit
    });
    return invoices.data;
  },

  // Get payment methods
  getPaymentMethods: async (customerId: string): Promise<Stripe.PaymentMethod[]> => {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    return paymentMethods.data;
  },

  // Detach payment method
  detachPaymentMethod: async (paymentMethodId: string): Promise<Stripe.PaymentMethod> => {
    return await stripe.paymentMethods.detach(paymentMethodId);
  },

  // Set default payment method
  setDefaultPaymentMethod: async (customerId: string, paymentMethodId: string): Promise<Stripe.Customer> => {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  },

  // Create customer portal session
  createCustomerPortalSession: async (customerId: string, returnUrl?: string): Promise<Stripe.BillingPortal.Session> => {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    });
  }
};

// Create checkout session
export const createCheckoutSession = async (
  params: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  } | string
): Promise<Stripe.Checkout.Session> => {
  // Support both object and string parameter for backwards compatibility
  const sessionConfig = typeof params === 'string' ? { priceId: params } : params;
  
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: sessionConfig.priceId,
        quantity: 1
      }
    ],
    success_url: sessionConfig.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: sessionConfig.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    metadata: sessionConfig.metadata || { priceId: sessionConfig.priceId }
  };

  if (sessionConfig.customerId) {
    sessionParams.customer = sessionConfig.customerId;
  } else {
    sessionParams.customer_creation = 'always';
    if (sessionConfig.customerEmail) {
      sessionParams.customer_email = sessionConfig.customerEmail;
    }
  }

  if (sessionConfig.trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: sessionConfig.trialDays
    };
  }

  return await stripe.checkout.sessions.create(sessionParams);
};

// Create billing portal session
export const createBillingPortalSession = async (
  customerId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> => {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`
  });
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  endpointSecret?: string
): Stripe.Event => {
  const webhookSecret = endpointSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

// Get billing info for dashboard
export const getBillingInfo = async (customerId: string, currentUsage?: any): Promise<any> => {
  try {
    const [customer, subscriptions, invoices, paymentMethods] = await Promise.all([
      stripeService.getCustomer(customerId),
      stripe.subscriptions.list({ customer: customerId, status: 'active' }),
      stripeService.getInvoices(customerId),
      stripeService.getPaymentMethods(customerId)
    ]);

    const subscription = subscriptions.data[0];
    
    return {
      customer,
      subscription,
      invoices,
      paymentMethods,
      currentPlan: subscription?.items.data[0]?.price.lookup_key || 'free',
      status: subscription?.status || 'inactive',
      usageStats: currentUsage || {
        annotationsCount: 0, // Would be fetched from your database
        storageUsed: 0,
        apiCallsCount: 0,
        collaboratorsCount: 1
      },
      planLimits: PRICING_PLANS.free.features // Default to free plan limits
    };
  } catch (error) {
    console.error('Error fetching billing info:', error);
    throw new Error('Failed to fetch billing information');
  }
};

// Export individual functions for convenience
export const getInvoices = stripeService.getInvoices;
export const getPaymentMethods = stripeService.getPaymentMethods;
export const detachPaymentMethod = stripeService.detachPaymentMethod;
export const setDefaultPaymentMethod = stripeService.setDefaultPaymentMethod;
export const updateSubscription = stripeService.updateSubscription;
export const cancelSubscription = stripeService.cancelSubscription;

export { stripe }; 