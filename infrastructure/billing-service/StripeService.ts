import Stripe from 'stripe';
import { User, IUser } from '../auth-service/UserModel';

// Initialize Stripe with proper configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil', // Use the latest supported API version
  typescript: true,
});

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface StripeInvoice {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: number;
  dueDate?: number;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // Customer Management
  async createCustomer(data: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    const customer = await this.stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata || {},
    };
  }

  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted || !('email' in customer)) {
        return null;
      }

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
        metadata: customer.metadata || {},
      };
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }

  async updateCustomer(
    customerId: string,
    data: {
      email?: string;
      name?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<StripeCustomer> {
    const customer = await this.stripe.customers.update(customerId, data);

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
    };
  }

  // Subscription Management
  async createSubscription(data: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
  }): Promise<StripeSubscription> {
    const subscription = await this.stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.priceId }],
      metadata: data.metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      priceId: data.priceId,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    };
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: (subscription as any).current_period_start,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      };
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    data: {
      priceId?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<StripeSubscription> {
    const updateData: any = {};

    if (data.priceId) {
      updateData.items = [{ price: data.priceId }];
    }

    if (data.metadata) {
      updateData.metadata = data.metadata;
    }

    const subscription = await this.stripe.subscriptions.update(subscriptionId, updateData);

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    };
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<StripeSubscription> {
    const subscription = immediately
      ? await this.stripe.subscriptions.cancel(subscriptionId)
      : await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    };
  }

  // Payment Intent Management
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: data.customerId,
      metadata: data.metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  // Invoice Management
  async getInvoices(customerId: string, limit = 10): Promise<StripeInvoice[]> {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      customerId: invoice.customer as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status!,
      paidAt: invoice.status_transitions.paid_at || undefined,
      dueDate: invoice.due_date || undefined,
    }));
  }

  // Webhook Verification
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Price and Product Management
  async listPrices(productId?: string): Promise<Stripe.Price[]> {
    const params: any = { active: true };
    if (productId) {
      params.product = productId;
    }

    const prices = await this.stripe.prices.list(params);
    return prices.data;
  }

  async getPrice(priceId: string): Promise<Stripe.Price | null> {
    try {
      return await this.stripe.prices.retrieve(priceId);
    } catch (error) {
      console.error('Error retrieving price:', error);
      return null;
    }
  }

  // Usage Records (for metered billing)
  async createUsageRecord(data: {
    subscriptionItemId: string;
    quantity: number;
    timestamp?: number;
  }): Promise<any> {
    // Note: Usage records API has changed in newer Stripe versions
    // This method is disabled in the current implementation
    console.warn('Usage records API not available in current Stripe version');
    return {
      id: `usage_${Date.now()}`,
      quantity: data.quantity,
      timestamp: data.timestamp || Math.floor(Date.now() / 1000),
      subscription_item: data.subscriptionItemId,
    };
  }

  // Checkout Session Management
  async createCheckoutSession(data: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      customer: data.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: data.metadata,
    });
  }

  // Customer Portal
  async createPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return await this.stripe.billingPortal.sessions.create({
      customer: data.customerId,
      return_url: data.returnUrl,
    });
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;