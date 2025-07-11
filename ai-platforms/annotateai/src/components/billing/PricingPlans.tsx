'use client';

import React, { useState } from 'react';
import { PRICING_PLANS, type PlanId } from '@/lib/billing/stripe';
import { createCheckoutSession } from '@/lib/billing/stripe';

interface PricingPlansProps {
  currentPlan?: PlanId;
  customerId?: string;
  customerEmail?: string;
  onPlanSelect?: (planId: PlanId) => void;
  showFreePlan?: boolean;
  className?: string;
}

interface PlanFeatureProps {
  feature: string;
  included: boolean;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ feature, included }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
      included 
        ? 'bg-annotate-accent-green text-white' 
        : 'bg-gray-200 text-gray-400'
    }`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
    <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-500'}`}>
      {feature}
    </span>
  </div>
);

const ZapIcon = () => (
  <svg className="w-6 h-6 text-annotate-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-6 h-6 text-annotate-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6 text-annotate-accent-purple" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-6 h-6 text-annotate-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-12 h-12 text-annotate-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const planIcons = {
  free: <ZapIcon />,
  starter: <ArrowRightIcon />,
  professional: <StarIcon />,
  enterprise: <CrownIcon />,
};

const planColors = {
  free: {
    badge: 'bg-gray-100 text-gray-800',
    button: 'btn-secondary',
    glass: 'annotate-glass',
  },
  starter: {
    badge: 'bg-annotate-primary-100 text-annotate-primary-800',
    button: 'btn-annotate',
    glass: 'annotate-glass',
  },
  professional: {
    badge: 'bg-annotate-accent-purple/10 text-annotate-accent-purple',
    button: 'btn-annotate',
    glass: 'annotate-ai-glass',
  },
  enterprise: {
    badge: 'bg-annotate-accent-cyan/10 text-annotate-accent-cyan',
    button: 'btn-annotate',
    glass: 'annotate-tool-glass',
  },
};

export default function PricingPlans({
  currentPlan = 'free',
  customerId,
  customerEmail,
  onPlanSelect,
  showFreePlan = true,
  className = '',
}: PricingPlansProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const plans = Object.entries(PRICING_PLANS).filter(([planId]) => 
    showFreePlan || planId !== 'free'
  ) as [PlanId, typeof PRICING_PLANS[PlanId]][];

  const handlePlanSelect = async (planId: PlanId) => {
    if (loadingPlan) return;
    
    if (planId === 'free') {
      onPlanSelect?.(planId);
      return;
    }

    if (!PRICING_PLANS[planId].stripePriceId) {
      console.error('No price ID configured for plan:', planId);
      return;
    }

    setLoadingPlan(planId);

    try {
      const session = await createCheckoutSession({
        priceId: PRICING_PLANS[planId].stripePriceId!,
        customerId,
        customerEmail,
        successUrl: `${window.location.origin}/dashboard/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        trialDays: planId === 'starter' ? 14 : undefined,
        metadata: {
          planId,
          upgrade: currentPlan !== planId ? 'true' : 'false',
        },
      });

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getDisplayPrice = (plan: typeof PRICING_PLANS[PlanId]) => {
    if (plan.price === 0) return 'Free';
    
    const price = isAnnual ? plan.price * 10 : plan.price; // 2 months free annually
    return `$${price}`;
  };

  const getPlanFeatures = (plan: typeof PRICING_PLANS[PlanId]) => {
    const features = [];
    
    if (typeof plan.features.projects === 'number') {
      features.push(`${plan.features.projects} projects`);
    } else {
      features.push('Unlimited projects');
    }
    
    if (typeof plan.features.annotations === 'number') {
      features.push(`${plan.features.annotations.toLocaleString()} annotations/month`);
    } else {
      features.push('Unlimited annotations');
    }
    
    features.push(`${plan.features.storage} storage`);
    
    if (typeof plan.features.aiInference === 'number') {
      features.push(`${plan.features.aiInference.toLocaleString()} AI inferences/month`);
    } else {
      features.push('Unlimited AI inferences');
    }
    
    if (typeof plan.features.teamMembers === 'number') {
      features.push(`${plan.features.teamMembers} team members`);
    } else {
      features.push('Unlimited team members');
    }
    
    // Add basic support info
    if (plan.features.priority) {
      features.push('Priority support');
    } else {
      features.push('Community support');
    }
    
    if (Array.isArray(plan.features.exportFormats)) {
      features.push(`${plan.features.exportFormats.join(', ')} export formats`);
    } else {
      features.push(plan.features.exportFormats);
    }
    
    if (plan.features.customModels) {
      features.push('Custom AI models');
    }
    
    if (plan.features.priority) {
      features.push('Priority processing');
    }
    
    if (plan.features.sso) {
      features.push('Single Sign-On (SSO)');
    }
    
    return features;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your AnnotateAI Plan
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Scale your computer vision projects with the right tools and capacity
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-annotate-primary-600' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-annotate-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-annotate-primary-600' : 'text-gray-500'}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="ml-2 px-2 py-1 bg-annotate-accent-green/10 text-annotate-accent-green text-xs font-medium rounded-full">
              Save 17%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId;
          const isProfessional = planId === 'professional';
          const features = getPlanFeatures(plan);
          
          return (
            <div
              key={planId}
              className={`relative ${planColors[planId].glass} p-6 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1 ${
                isProfessional ? 'border-2 border-annotate-accent-purple/30 shadow-lg shadow-annotate-accent-purple/10' : ''
              }`}
            >
              {/* Most Popular Badge */}
              {isProfessional && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-annotate-accent-purple to-annotate-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  {planIcons[planId]}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {getDisplayPrice(plan)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {isAnnual && plan.price > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <PlanFeature key={index} feature={feature} included={true} />
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                {isCurrentPlan ? (
                  <div className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-lg font-medium">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(planId)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      planColors[planId].button === 'btn-annotate'
                        ? 'bg-gradient-to-r from-annotate-primary-500 to-annotate-primary-600 text-white hover:from-annotate-primary-600 hover:to-annotate-primary-700 shadow-lg shadow-annotate-primary-500/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:translateY(-0.5px)`}
                  >
                    {loadingPlan === planId ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : plan.price === 0 ? (
                      'Get Started Free'
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                )}
              </div>

              {/* Trial Info */}
              {planId === 'starter' && !isCurrentPlan && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  14-day free trial, no credit card required
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise Contact */}
      <div className="mt-16 text-center">
        <div className="annotate-glass p-8 rounded-2xl max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <ShieldIcon />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Something Custom?
          </h3>
          <p className="text-gray-600 mb-6">
            Looking for enterprise features, custom integrations, or volume discounts? 
            Let's talk about a solution that fits your specific needs.
          </p>
          <button className="bg-gradient-to-r from-annotate-accent-cyan to-annotate-primary-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:transform hover:-translate-y-0.5">
            Contact Sales
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="annotate-glass p-6 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">
              Can I change plans anytime?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the end of your billing cycle for downgrades.
            </p>
          </div>
          
          <div className="annotate-glass p-6 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">
              What happens to my data if I cancel?
            </h4>
            <p className="text-gray-600 text-sm">
              Your projects and annotations remain accessible for 30 days after cancellation. You can export your data anytime during this period.
            </p>
          </div>
          
          <div className="annotate-glass p-6 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">
              Do you offer educational discounts?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes! We offer significant discounts for students, teachers, and educational institutions. Contact us with your academic email for details.
            </p>
          </div>
          
          <div className="annotate-glass p-6 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">
              Is there an API available?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes, our REST API is available starting with the Professional plan. Enterprise customers get advanced API features and higher rate limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 