'use client';

import React, { useState, useEffect } from 'react';
import { createCheckoutSession, PRICING_PLANS } from '@/lib/billing/stripe';

interface SubscriptionData {
  currentPlan: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete';
  canUpgrade: boolean;
  canDowngrade: boolean;
}

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
}

interface PlanComparison {
  planId: string;
  planName: string;
  price: number;
  features: PlanFeature[];
  isCurrent: boolean;
  isRecommended: boolean;
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/subscription');
      if (!response.ok) {
        throw new Error('Failed to load subscription data');
      }
      const data = await response.json();
      setSubscription(data);
      setBillingCycle(data.billingCycle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string, cycle: 'monthly' | 'yearly') => {
    try {
      setUpgradeLoading(planId);
      
      const plan = PRICING_PLANS[planId.toUpperCase() as keyof typeof PRICING_PLANS];
      if (!plan.stripePriceId) {
        throw new Error('Invalid plan');
      }

      const checkout = await createCheckoutSession({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/billing/success`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
        trialDays: planId === 'starter' ? 14 : 0,
      });

      if (checkout.url) {
        window.location.href = checkout.url;
      }
    } catch (err) {
      setError('Failed to initiate plan change');
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setShowCancelDialog(false);
      await loadSubscriptionData();
    } catch (err) {
      setError('Failed to cancel subscription');
    }
  };

  const getPlanComparison = (): PlanComparison[] => {
    const plans = Object.entries(PRICING_PLANS).map(([key, plan]) => ({
      planId: key.toLowerCase(),
      planName: plan.name,
      price: billingCycle === 'yearly' ? plan.price * 10 : plan.price, // 17% discount for yearly
      features: [
        {
          name: 'Projects',
          included: true,
          limit: typeof plan.features.projects === 'string' ? plan.features.projects : plan.features.projects.toLocaleString(),
        },
        {
          name: 'Annotations',
          included: true,
          limit: typeof plan.features.annotations === 'string' ? plan.features.annotations : plan.features.annotations.toLocaleString(),
        },
        {
          name: 'Storage',
          included: true,
          limit: plan.features.storage,
        },
        {
          name: 'AI Inference',
          included: true,
          limit: typeof (plan.features as any).aiInference === 'string' ? (plan.features as any).aiInference : (plan.features as any).aiInference.toLocaleString(),
        },
        {
          name: 'Team Members',
          included: true,
          limit: typeof plan.features.teamMembers === 'string' ? plan.features.teamMembers : plan.features.teamMembers.toString(),
        },
        {
          name: 'Priority Support',
          included: (plan.features as any).priority || false,
        },
        {
          name: 'Custom Models',
          included: (plan.features as any).customModels || false,
        },
        {
          name: 'SSO Integration',
          included: (plan.features as any).sso || false,
        },
      ],
      isCurrent: subscription?.currentPlan.toLowerCase() === plan.name.toLowerCase(),
      isRecommended: key === 'PROFESSIONAL',
    }));

    return plans;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold">Error loading subscription</p>
          <p className="text-white/70 mt-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-white/70">Choose the plan that best fits your needs</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="annotate-glass rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Current Subscription</h2>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-indigo-400">{subscription.currentPlan}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.subscriptionStatus === 'active' ? 'bg-green-600 text-white' :
                    subscription.subscriptionStatus === 'past_due' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {subscription.subscriptionStatus.charAt(0).toUpperCase() + subscription.subscriptionStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                <p className="text-white font-semibold">${subscription.planPrice}/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="annotate-glass rounded-xl p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getPlanComparison().map((plan) => (
            <div
              key={plan.planId}
              className={`annotate-glass rounded-xl p-6 relative ${
                plan.isRecommended ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.planName}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-indigo-400">
                    ${plan.price === 0 ? '0' : (billingCycle === 'yearly' ? Math.floor(plan.price / 12) : plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-white/70 text-sm">
                      /{billingCycle === 'yearly' ? 'month' : 'month'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-white/60 text-xs">
                    Billed annually at ${plan.price}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      feature.included ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {feature.included && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white/80 text-sm">
                      {feature.name}
                      {feature.limit && (
                        <span className="text-white/60 ml-1">({feature.limit})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {plan.isCurrent ? (
                  <div className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center text-sm font-medium">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanChange(plan.planId, billingCycle)}
                    disabled={upgradeLoading === plan.planId}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                  >
                    {upgradeLoading === plan.planId ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      `${plan.planName === 'Free' ? 'Downgrade' : 'Upgrade'} to ${plan.planName}`
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Actions */}
        {subscription && subscription.subscriptionStatus === 'active' && (
          <div className="annotate-glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Subscription Actions</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-2">Need to cancel your subscription?</p>
                <p className="text-white/60 text-sm">You'll keep access until your next billing date.</p>
              </div>
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="annotate-glass rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Cancel Subscription</h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to cancel your subscription? You'll keep access until your next billing date,
                but won't be charged again.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 