'use client';

import React, { useState, useEffect } from 'react';
import { 
  getPaymentMethods, 
  detachPaymentMethod, 
  setDefaultPaymentMethod 
} from '@/lib/billing/stripe';

interface PaymentMethodProps {
  customerId: string;
  onPaymentMethodsChange?: () => void;
  className?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
  };
}

const CreditCardIcon = ({ brand }: { brand: string }) => {
  const brandColors = {
    visa: 'text-blue-600',
    mastercard: 'text-red-500',
    amex: 'text-blue-800',
    discover: 'text-orange-500',
    default: 'text-gray-500',
  };

  const color = brandColors[brand as keyof typeof brandColors] || brandColors.default;

  return (
    <svg className={`w-8 h-5 ${color}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M4 8h16v2H4z" fill="white" />
      <path d="M4 12h4v2H4zm6 0h6v2h-6z" fill="white" />
    </svg>
  );
};

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default function PaymentMethod({
  customerId,
  onPaymentMethodsChange,
  className = '',
}: PaymentMethodProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, [customerId]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethods(customerId);
      setPaymentMethods(methods as PaymentMethod[]);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setActionLoading(paymentMethodId);
      await detachPaymentMethod(paymentMethodId);
      await loadPaymentMethods();
      onPaymentMethodsChange?.();
    } catch (err) {
      setError('Failed to remove payment method');
      console.error('Error removing payment method:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setActionLoading(paymentMethodId);
      await setDefaultPaymentMethod(customerId, paymentMethodId);
      await loadPaymentMethods();
      onPaymentMethodsChange?.();
    } catch (err) {
      setError('Failed to set default payment method');
      console.error('Error setting default payment method:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (loading) {
    return (
      <div className={`annotate-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`annotate-glass p-6 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-annotate-primary-500 to-annotate-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-primary-700 hover:transform hover:-translate-y-0.5"
        >
          <PlusIcon />
          <span>Add Card</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <div className="annotate-tool-glass p-6 rounded-xl inline-block">
            <CreditCardIcon brand="default" />
            <p className="text-gray-500 mt-2">No payment methods added</p>
            <p className="text-sm text-gray-400 mt-1">
              Add a credit card to manage your subscription
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="annotate-tool-glass p-4 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CreditCardIcon brand={method.card?.brand || 'default'} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {formatCardBrand(method.card?.brand || '')} 
                        •••• {method.card?.last4}
                      </span>
                      {/* Add default badge logic here when you have access to customer data */}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Expires {formatExpiryDate(method.card?.exp_month || 0, method.card?.exp_year || 0)}</span>
                      {method.billing_details?.name && (
                        <span className="ml-2">• {method.billing_details.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    disabled={actionLoading === method.id}
                    className="text-sm text-annotate-primary-600 hover:text-annotate-primary-700 font-medium disabled:opacity-50"
                  >
                    {actionLoading === method.id ? (
                      <div className="w-4 h-4 border-2 border-annotate-primary-600/30 border-t-annotate-primary-600 rounded-full animate-spin" />
                    ) : (
                      'Set Default'
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    disabled={actionLoading === method.id}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                    title="Remove payment method"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal Placeholder */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="annotate-glass p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment Method</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="glass-input w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-annotate-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="glass-input w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-annotate-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="glass-input w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-annotate-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="glass-input w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-annotate-primary-500"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 bg-gradient-to-r from-annotate-primary-500 to-annotate-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-primary-700"
                >
                  Add Card
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                <CheckIcon />
                <span className="ml-1">Your payment information is secured with 256-bit SSL encryption</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secured by Stripe • PCI DSS compliant</span>
        </div>
      </div>
    </div>
  );
} 