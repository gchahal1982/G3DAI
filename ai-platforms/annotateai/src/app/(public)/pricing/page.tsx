'use client';

import { useState } from 'react';
import { Check, X, Star, Users, Zap, Shield, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for exploring AnnotateAI',
      price: { monthly: 0, annual: 0 },
      features: [
        '100 annotations per month',
        '1 active project',
        'Basic annotation tools',
        'Community support',
        'Standard export formats',
        '1GB storage',
      ],
      limitations: [
        'No AI assistance',
        'No team collaboration',
        'No advanced analytics',
        'No priority support',
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray',
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for small teams and individual researchers',
      price: { monthly: 29, annual: 24 },
      features: [
        '5,000 annotations per month',
        '5 active projects',
        'All annotation tools',
        'Basic AI assistance',
        'Team collaboration (up to 3 members)',
        'Email support',
        'All export formats',
        '10GB storage',
        'Project templates',
        'Basic analytics',
      ],
      limitations: [
        'Limited AI inference',
        'No custom models',
        'No API access',
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
      color: 'blue',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced features for growing teams',
      price: { monthly: 99, annual: 82 },
      features: [
        '25,000 annotations per month',
        'Unlimited projects',
        'Advanced AI assistance',
        'Custom model integration',
        'Team collaboration (up to 15 members)',
        'Priority support',
        'Advanced analytics',
        'API access',
        '100GB storage',
        'Quality assurance workflows',
        'Custom export formats',
        'Advanced integrations',
      ],
      limitations: [
        'No dedicated support',
        'No custom deployment',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      color: 'indigo',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete solution for large organizations',
      price: { monthly: 299, annual: 249 },
      features: [
        'Unlimited annotations',
        'Unlimited projects',
        'Full AI suite',
        'Custom model training',
        'Unlimited team members',
        'Dedicated support manager',
        'Advanced security & compliance',
        'Custom integrations',
        'Unlimited storage',
        'Advanced workflow automation',
        'Custom deployment options',
        'SLA guarantees',
        'HIPAA compliance',
        'SOC 2 certification',
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple',
    },
  ];

  const faqs = [
    {
      question: 'What counts as an annotation?',
      answer: 'Each individual label, bounding box, polygon, or segmentation mask counts as one annotation. Batch operations count each item separately.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans include a 14-day free trial with full access to features. No credit card required to start.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'You can export all your data before cancellation. We retain your data for 30 days after cancellation for easy reactivation.',
    },
    {
      question: 'Do you offer custom enterprise solutions?',
      answer: 'Yes, we offer custom solutions for large enterprises including on-premise deployment, custom integrations, and dedicated support.',
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'free') {
      window.location.href = '/signup?plan=free';
    } else if (planId === 'enterprise') {
      window.location.href = '/contact?plan=enterprise';
    } else {
      window.location.href = `/signup?plan=${planId}&billing=${billingCycle}`;
    }
  };

  const getDiscountPercentage = () => {
    return Math.round(((29 - 24) / 29) * 100); // 17% discount for annual
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your annotation needs. Start free and scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center annotate-glass p-2 rounded-xl mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {getDiscountPercentage()}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative annotate-glass rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                plan.popular
                  ? 'ring-2 ring-indigo-500 ring-opacity-50'
                  : ''
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>

                {billingCycle === 'annual' && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all mb-6 ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  Features Included
                </h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}

                {plan.limitations.length > 0 && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">
                        Not Included
                      </h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start">
                          <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare All Features
          </h2>
          <p className="text-gray-600">
            See exactly what's included in each plan
          </p>
        </div>

        <div className="annotate-glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Annotations per month</td>
                  <td className="py-4 px-6 text-center text-gray-600">100</td>
                  <td className="py-4 px-6 text-center text-gray-600">5,000</td>
                  <td className="py-4 px-6 text-center text-gray-600">25,000</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Active projects</td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">5</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Team members</td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">3</td>
                  <td className="py-4 px-6 text-center text-gray-600">15</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">AI assistance</td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Custom models</td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">API access</td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Priority support</td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">HIPAA compliance</td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Get answers to common questions about our pricing and plans
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="annotate-glass rounded-xl p-6">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-indigo-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Data Labeling?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of researchers and teams using AnnotateAI to accelerate their AI projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/signup?plan=free'}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Today
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">50M+</div>
              <div className="text-sm text-gray-600">Annotations Created</div>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime SLA</div>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-8 w-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 