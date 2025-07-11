'use client';

import React, { useState, useEffect } from 'react';
import { createCheckoutSession } from '@/lib/billing/stripe';

interface UsageStats {
  annotationsCount: number;
  storageUsed: number;
  apiCallsCount: number;
  collaboratorsCount: number;
}

interface BillingInfo {
  currentPlan: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete';
  usageStats: UsageStats;
  planLimits: {
    annotations: number;
    storage: number;
    apiCalls: number;
    collaborators: number;
  };
}

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export default function BillingDashboard() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/dashboard');
      if (!response.ok) {
        throw new Error('Failed to load billing data');
      }
      const data = await response.json();
      setBillingInfo(data.billingInfo);
      setPaymentHistory(data.paymentHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const checkout = await createCheckoutSession({
        priceId: planId,
        successUrl: `${window.location.origin}/billing/success`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
        trialDays: 14,
      });
      if (checkout.url) {
        window.location.href = checkout.url;
      }
    } catch (err) {
      setError('Failed to initiate upgrade');
    }
  };

  const formatUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatStorage = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading billing information...</p>
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
          <p className="text-white font-semibold">Error loading billing data</p>
          <p className="text-white/70 mt-2">{error}</p>
          <button
            onClick={loadBillingData}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!billingInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing Dashboard</h1>
          <p className="text-white/70">Manage your subscription and billing information</p>
        </div>

        {/* Subscription Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="annotate-glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-indigo-400">{billingInfo.currentPlan}</h3>
                  <p className="text-white/70">
                    ${billingInfo.planPrice}/{billingInfo.billingCycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    billingInfo.subscriptionStatus === 'active' ? 'bg-green-600 text-white' :
                    billingInfo.subscriptionStatus === 'past_due' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {billingInfo.subscriptionStatus.charAt(0).toUpperCase() + billingInfo.subscriptionStatus.slice(1)}
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-white/70 text-sm">
                  Next billing date: {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="annotate-glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleUpgrade('professional')}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Upgrade Plan
              </button>
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm">
                Manage Payment Methods
              </button>
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm">
                Download Invoices
              </button>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Usage Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Annotations */}
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Annotations</span>
                <span className="text-cyan-400 text-sm">
                  {formatNumber(billingInfo.usageStats.annotationsCount)}/{billingInfo.planLimits.annotations === -1 ? '∞' : formatNumber(billingInfo.planLimits.annotations)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatUsagePercentage(billingInfo.usageStats.annotationsCount, billingInfo.planLimits.annotations)}%` }}
                ></div>
              </div>
            </div>

            {/* Storage */}
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Storage</span>
                <span className="text-purple-400 text-sm">
                  {formatStorage(billingInfo.usageStats.storageUsed)}/{billingInfo.planLimits.storage === -1 ? '∞' : formatStorage(billingInfo.planLimits.storage)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatUsagePercentage(billingInfo.usageStats.storageUsed, billingInfo.planLimits.storage)}%` }}
                ></div>
              </div>
            </div>

            {/* API Calls */}
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">API Calls</span>
                <span className="text-indigo-400 text-sm">
                  {formatNumber(billingInfo.usageStats.apiCallsCount)}/{billingInfo.planLimits.apiCalls === -1 ? '∞' : formatNumber(billingInfo.planLimits.apiCalls)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatUsagePercentage(billingInfo.usageStats.apiCallsCount, billingInfo.planLimits.apiCalls)}%` }}
                ></div>
              </div>
            </div>

            {/* Collaborators */}
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Collaborators</span>
                <span className="text-emerald-400 text-sm">
                  {billingInfo.usageStats.collaboratorsCount}/{billingInfo.planLimits.collaborators === -1 ? '∞' : billingInfo.planLimits.collaborators}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatUsagePercentage(billingInfo.usageStats.collaboratorsCount, billingInfo.planLimits.collaborators)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="annotate-glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-white/80 font-medium">Date</th>
                  <th className="text-left py-3 text-white/80 font-medium">Description</th>
                  <th className="text-left py-3 text-white/80 font-medium">Amount</th>
                  <th className="text-left py-3 text-white/80 font-medium">Status</th>
                  <th className="text-left py-3 text-white/80 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-white/90">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="py-3 text-white/90">{payment.description}</td>
                    <td className="py-3 text-white/90">${payment.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-600 text-white' :
                        payment.status === 'pending' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      {payment.invoiceUrl && (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 