'use client';

import React, { useState, useEffect } from 'react';

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  paymentMethod?: {
    type: 'card' | 'ach' | 'wire';
    last4?: string;
    brand?: string;
  };
  nextRetryDate?: string;
}

interface PaymentStats {
  totalPaid: number;
  totalFailed: number;
  successRate: number;
  averageAmount: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'failed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/payments');
      if (!response.ok) {
        throw new Error('Failed to load payment history');
      }
      const data = await response.json();
      setPayments(data.payments);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/billing/payments/${paymentId}/retry`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }
      await loadPaymentHistory();
    } catch (err) {
      setError('Failed to retry payment');
    }
  };

  const downloadInvoice = async (invoiceUrl: string, invoiceNumber: string) => {
    try {
      const response = await fetch(invoiceUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download invoice');
    }
  };

  const getFilteredPayments = () => {
    let filtered = payments;
    
    if (filter !== 'all') {
      filtered = filtered.filter(payment => payment.status === filter);
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = a.amount;
        bValue = b.amount;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'ach':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'wire':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading payment history...</p>
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
          <p className="text-white font-semibold">Error loading payment history</p>
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

  const filteredPayments = getFilteredPayments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
          <p className="text-white/70">Track your payments and manage invoices</p>
        </div>

        {/* Payment Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Paid</span>
                <div className="text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">${stats.totalPaid.toLocaleString()}</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Success Rate</span>
                <div className="text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Average Amount</span>
                <div className="text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">${stats.averageAmount.toFixed(2)}</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Next Payment</span>
                <div className="text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-lg font-bold text-white">${stats.nextPaymentAmount}</div>
              <div className="text-xs text-white/60">{new Date(stats.nextPaymentDate).toLocaleDateString()}</div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1 text-sm"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
            >
              {sortOrder === 'asc' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Ascending
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Descending
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="annotate-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Invoice</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Description</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Payment Method</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/60">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white/90">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-white/90">
                        {payment.invoiceNumber ? (
                          <span className="text-indigo-400">{payment.invoiceNumber}</span>
                        ) : (
                          <span className="text-white/60">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-white/90">
                        {payment.description}
                      </td>
                      <td className="py-4 px-6 text-white/90">
                        {payment.paymentMethod ? (
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod.type)}
                            <span className="capitalize">{payment.paymentMethod.brand || payment.paymentMethod.type}</span>
                            {payment.paymentMethod.last4 && (
                              <span className="text-white/60">••••{payment.paymentMethod.last4}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/60">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-white/90 font-medium">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        {payment.status === 'failed' && payment.nextRetryDate && (
                          <div className="text-xs text-white/60 mt-1">
                            Retry: {new Date(payment.nextRetryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {payment.invoiceUrl && (
                            <button
                              onClick={() => downloadInvoice(payment.invoiceUrl!, payment.invoiceNumber!)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                            >
                              Download
                            </button>
                          )}
                          {payment.status === 'failed' && (
                            <button
                              onClick={() => retryPayment(payment.id)}
                              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 