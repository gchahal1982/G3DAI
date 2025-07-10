import Stripe from 'stripe';
import { User, IUser } from '../../auth-service/src/models/User';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

// Service pricing configuration
export const SERVICE_PRICING = {
    'vision-pro': {
        free: { limit: 10, price: 0 },
        starter: { limit: 100, price: 4900 }, // $49/month
        professional: { limit: 1000, price: 19900 }, // $199/month
        enterprise: { limit: -1, price: 99900 } // $999/month, unlimited
    },
    'codeforge': {
        free: { limit: 50, price: 0 },
        starter: { limit: 500, price: 2900 }, // $29/month
        professional: { limit: 5000, price: 9900 }, // $99/month
        enterprise: { limit: -1, price: 49900 } // $499/month
    },
    'creative-studio': {
        free: { limit: 25, price: 0 },
        starter: { limit: 250, price: 3900 }, // $39/month
        professional: { limit: 2500, price: 14900 }, // $149/month
        enterprise: { limit: -1, price: 69900 } // $699/month
    },
    'dataforge': {
        free: { limit: 100, price: 0 },
        starter: { limit: 1000, price: 5900 }, // $59/month
        professional: { limit: 10000, price: 24900 }, // $249/month
        enterprise: { limit: -1, price: 119900 } // $1199/month
    },
    'secureai': {
        free: { limit: 50, price: 0 },
        starter: { limit: 500, price: 7900 }, // $79/month
        professional: { limit: 5000, price: 29900 }, // $299/month
        enterprise: { limit: -1, price: 149900 } // $1499/month
    },
    'automl': {
        free: { limit: 5, price: 0 },
        starter: { limit: 50, price: 9900 }, // $99/month
        professional: { limit: 500, price: 39900 }, // $399/month
        enterprise: { limit: -1, price: 199900 } // $1999/month
    },
    'chatbuilder': {
        free: { limit: 1000, price: 0 },
        starter: { limit: 10000, price: 1900 }, // $19/month
        professional: { limit: 100000, price: 7900 }, // $79/month
        enterprise: { limit: -1, price: 39900 } // $399/month
    },
    'videoai': {
        free: { limit: 10, price: 0 },
        starter: { limit: 100, price: 7900 }, // $79/month
        professional: { limit: 1000, price: 29900 }, // $299/month
        enterprise: { limit: -1, price: 149900 } // $1499/month
    },
    'healthai': {
        free: { limit: 100, price: 0 },
        starter: { limit: 1000, price: 3900 }, // $39/month
        professional: { limit: 10000, price: 15900 }, // $159/month
        enterprise: { limit: -1, price: 79900 } // $799/month
    },
    'financeai': {
        free: { limit: 50, price: 0 },
        starter: { limit: 500, price: 9900 }, // $99/month
        professional: { limit: 5000, price: 39900 }, // $399/month
        enterprise: { limit: -1, price: 199900 } // $1999/month
    },
    'voiceai': {
        free: { limit: 60, price: 0 }, // 60 minutes
        starter: { limit: 600, price: 4900 }, // $49/month
        professional: { limit: 6000, price: 19900 }, // $199/month
        enterprise: { limit: -1, price: 99900 } // $999/month
    },
    'translateai': {
        free: { limit: 10000, price: 0 }, // 10k characters
        starter: { limit: 100000, price: 1900 }, // $19/month
        professional: { limit: 1000000, price: 7900 }, // $79/month
        enterprise: { limit: -1, price: 39900 } // $399/month
    },
    'documind': {
        free: { limit: 20, price: 0 },
        starter: { limit: 200, price: 3900 }, // $39/month
        professional: { limit: 2000, price: 15900 }, // $159/month
        enterprise: { limit: -1, price: 79900 } // $799/month
    },
    'mesh3d': {
        free: { limit: 5, price: 0 },
        starter: { limit: 50, price: 9900 }, // $99/month
        professional: { limit: 500, price: 39900 }, // $399/month
        enterprise: { limit: -1, price: 199900 } // $1999/month
    },
    'edgeai': {
        free: { limit: 10, price: 0 },
        starter: { limit: 100, price: 4900 }, // $49/month
        professional: { limit: 1000, price: 19900 }, // $199/month
        enterprise: { limit: -1, price: 99900 } // $999/month
    },
    'legalai': {
        free: { limit: 25, price: 0 },
        starter: { limit: 250, price: 7900 }, // $79/month
        professional: { limit: 2500, price: 31900 }, // $319/month
        enterprise: { limit: -1, price: 159900 } // $1599/month
    }
};

// Bundle pricing for multiple services
export const BUNDLE_PRICING = {
    'startup-bundle': {
        services: ['codeforge', 'creative-studio', 'chatbuilder'],
        price: 9900, // $99/month (save $67)
        limits: {
            'codeforge': 500,
            'creative-studio': 250,
            'chatbuilder': 10000
        }
    },
    'business-bundle': {
        services: ['dataforge', 'secureai', 'financeai', 'legalai'],
        price: 39900, // $399/month (save $160)
        limits: {
            'dataforge': 1000,
            'secureai': 500,
            'financeai': 500,
            'legalai': 250
        }
    },
    'enterprise-all-access': {
        services: Object.keys(SERVICE_PRICING),
        price: 199900, // $1999/month (save $1000+)
        limits: Object.fromEntries(
            Object.keys(SERVICE_PRICING).map(service => [service, 10000])
        )
    }
};

export class StripeService {

    // Create customer in Stripe
    async createCustomer(user: IUser): Promise<Stripe.Customer> {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName,
            metadata: {
                userId: (user._id as any).toString(),
                organizationId: user.organizationId?.toString() || '',
            }
        });

        // Update user with customer ID
        user.customerId = customer.id;
        await user.save();

        return customer;
    }

    // Create subscription for a service
    async createSubscription(
        userId: string,
        serviceName: string,
        tier: 'starter' | 'professional' | 'enterprise'
    ): Promise<Stripe.Subscription> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Ensure customer exists
        if (!user.customerId) {
            await this.createCustomer(user);
        }

        // Get pricing for service and tier
        const pricing = SERVICE_PRICING[serviceName as keyof typeof SERVICE_PRICING];
        if (!pricing) throw new Error('Invalid service name');

        const tierPricing = pricing[tier];
        if (!tierPricing) throw new Error('Invalid tier');

        // Create price object in Stripe if it doesn't exist
        const priceId = await this.getOrCreatePrice(serviceName, tier, tierPricing.price);

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: user.customerId!,
            items: [{ price: priceId }],
            metadata: {
                userId: (user._id as any).toString(),
                serviceName,
                tier,
                usageLimit: tierPricing.limit.toString()
            },
            trial_period_days: user.subscriptionStatus === 'trialing' ? 14 : undefined
        });

        // Update user's service access
        const serviceAccess = user.serviceAccess.get(serviceName) || {
            enabled: true,
            tier: 'free',
            usageLimit: 100,
            usageCount: 0,
            resetDate: new Date()
        };

        serviceAccess.tier = tier;
        serviceAccess.usageLimit = tierPricing.limit === -1 ? 999999 : tierPricing.limit;
        serviceAccess.enabled = true;
        user.serviceAccess.set(serviceName, serviceAccess);

        // Update subscription info
        user.subscriptionId = subscription.id;
        user.subscriptionStatus = subscription.status as any;
        user.subscriptionPlan = tier;

        await user.save();

        return subscription;
    }

    // Create bundle subscription
    async createBundleSubscription(
        userId: string,
        bundleName: keyof typeof BUNDLE_PRICING
    ): Promise<Stripe.Subscription> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        if (!user.customerId) {
            await this.createCustomer(user);
        }

        const bundle = BUNDLE_PRICING[bundleName];
        const priceId = await this.getOrCreateBundlePrice(bundleName, bundle.price);

        const subscription = await stripe.subscriptions.create({
            customer: user.customerId!,
            items: [{ price: priceId }],
            metadata: {
                userId: (user._id as any).toString(),
                bundleName,
                services: bundle.services.join(',')
            }
        });

        // Update service access for all services in bundle
        for (const serviceName of bundle.services) {
            const serviceAccess = user.serviceAccess.get(serviceName) || {
                enabled: true,
                tier: 'free',
                usageLimit: 100,
                usageCount: 0,
                resetDate: new Date()
            };

            serviceAccess.tier = 'professional';
            serviceAccess.usageLimit = bundle.limits[serviceName] || 1000;
            serviceAccess.enabled = true;
            user.serviceAccess.set(serviceName, serviceAccess);
        }

        user.subscriptionId = subscription.id;
        user.subscriptionStatus = subscription.status as any;
        user.subscriptionPlan = 'professional';

        await user.save();

        return subscription;
    }

    // Track usage and bill if needed
    async trackUsage(
        userId: string,
        serviceName: string,
        operation: string,
        quantity: number = 1
    ): Promise<void> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Track usage in user model
        await user.trackUsage(serviceName, operation);

        // If user has a subscription, report usage to Stripe for billing
        if (user.subscriptionId && user.subscriptionStatus === 'active') {
            const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

            // Find usage-based items in subscription
            for (const item of subscription.items.data) {
                if (item.price.recurring?.usage_type === 'metered') {
                    await (stripe.subscriptionItems as any).createUsageRecord(item.id, {
                        quantity,
                        timestamp: Math.floor(Date.now() / 1000),
                        action: 'increment'
                    });
                }
            }
        }

        // Check if user has exceeded limits
        const serviceAccess = user.serviceAccess.get(serviceName);
        if (serviceAccess && serviceAccess.usageCount >= serviceAccess.usageLimit) {
            // Send notification about limit exceeded
            await this.sendUsageLimitNotification(user, serviceName);
        }
    }

    // Handle webhook events from Stripe
    async handleWebhook(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.payment_succeeded':
                await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
                break;
        }
    }

    // Get usage analytics for admin dashboard
    async getUsageAnalytics(organizationId?: string): Promise<any> {
        const query = organizationId ? { organizationId } : {};
        const users = await User.find(query);

        const analytics = {
            totalUsers: users.length,
            activeSubscriptions: 0,
            totalRevenue: 0,
            serviceUsage: {} as any,
            planDistribution: {} as any
        };

        for (const user of users) {
            if (user.subscriptionStatus === 'active') {
                analytics.activeSubscriptions++;
            }

            analytics.totalRevenue += user.analytics.totalCost;

            // Count plan distribution
            analytics.planDistribution[user.subscriptionPlan] =
                (analytics.planDistribution[user.subscriptionPlan] || 0) + 1;

            // Aggregate service usage
            for (const [serviceName, access] of user.serviceAccess.entries()) {
                if (!analytics.serviceUsage[serviceName]) {
                    analytics.serviceUsage[serviceName] = {
                        totalUsers: 0,
                        totalUsage: 0,
                        averageUsage: 0
                    };
                }

                analytics.serviceUsage[serviceName].totalUsers++;
                analytics.serviceUsage[serviceName].totalUsage += access.usageCount;
            }
        }

        // Calculate averages
        for (const serviceName in analytics.serviceUsage) {
            const service = analytics.serviceUsage[serviceName];
            service.averageUsage = Math.round(service.totalUsage / service.totalUsers);
        }

        return analytics;
    }

    // Private helper methods
    private async getOrCreatePrice(serviceName: string, tier: string, amount: number): Promise<string> {
        const productId = `g3d-${serviceName}-${tier}`;

        // Try to find existing price
        const prices = await stripe.prices.list({
            product: productId,
            active: true
        });

        if (prices.data.length > 0) {
            return prices.data[0].id;
        }

        // Create product if it doesn't exist
        let product;
        try {
            product = await stripe.products.retrieve(productId);
        } catch (error) {
            product = await stripe.products.create({
                id: productId,
                name: `G3D ${serviceName} - ${tier}`,
                description: `${tier} tier access to G3D ${serviceName} service`
            });
        }

        // Create price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount,
            currency: 'usd',
            recurring: { interval: 'month' }
        });

        return price.id;
    }

    private async getOrCreateBundlePrice(bundleName: string, amount: number): Promise<string> {
        const productId = `g3d-bundle-${bundleName}`;

        const prices = await stripe.prices.list({
            product: productId,
            active: true
        });

        if (prices.data.length > 0) {
            return prices.data[0].id;
        }

        let product;
        try {
            product = await stripe.products.retrieve(productId);
        } catch (error) {
            product = await stripe.products.create({
                id: productId,
                name: `G3D ${bundleName}`,
                description: `Bundle access to multiple G3D AI services`
            });
        }

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount,
            currency: 'usd',
            recurring: { interval: 'month' }
        });

        return price.id;
    }

    private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata.userId;
        if (!userId) return;

        const user = await User.findById(userId);
        if (!user) return;

        user.subscriptionId = subscription.id;
        user.subscriptionStatus = subscription.status as any;

        if (subscription.status === 'active') {
            user.subscriptionEndsAt = new Date((subscription as any).current_period_end * 1000);
        }

        await user.save();
    }

    private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
        const userId = subscription.metadata.userId;
        if (!userId) return;

        const user = await User.findById(userId);
        if (!user) return;

        user.subscriptionStatus = 'canceled';

        // Downgrade all services to free tier
        for (const [serviceName, access] of user.serviceAccess.entries()) {
            const freeLimit = SERVICE_PRICING[serviceName as keyof typeof SERVICE_PRICING]?.free?.limit || 100;
            access.tier = 'free';
            access.usageLimit = freeLimit;
            user.serviceAccess.set(serviceName, access);
        }

        await user.save();
    }

    private async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
        // Payment succeeded - could trigger welcome emails, etc.
        console.log(`Payment succeeded for invoice ${invoice.id}`);
    }

    private async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
        // Payment failed - could trigger retry logic, notifications, etc.
        console.log(`Payment failed for invoice ${invoice.id}`);
    }

    private async sendUsageLimitNotification(user: IUser, serviceName: string): Promise<void> {
        // Implementation would send email/notification about usage limits
        console.log(`Usage limit exceeded for user ${user.email} on service ${serviceName}`);
    }
}

export const stripeService = new StripeService();