import { NextRequest, NextResponse } from 'next/server';
import { getInvoices, getPaymentMethods } from '@/lib/billing/stripe';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/auth
    const userId = 'user_123';
    const customerId = 'cus_123';
    
    // Get invoices and payment methods
    const invoices = await getInvoices(customerId, 50);
    const paymentMethods = await getPaymentMethods(customerId);
    
    // Transform invoices to payment history format
    const payments = invoices.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: (invoice.amount_paid || 0) / 100, // Convert from cents
      status: invoice.status === 'paid' ? 'paid' : 
              invoice.status === 'draft' ? 'pending' : 
              invoice.status === 'open' ? 'pending' : 'failed',
      description: invoice.description || 'Subscription Payment',
      invoiceUrl: invoice.invoice_pdf || undefined,
      invoiceNumber: invoice.number || undefined,
      paymentMethod: invoice.charge ? {
        type: 'card' as const,
        last4: (invoice.charge as any).payment_method_details?.card?.last4,
        brand: (invoice.charge as any).payment_method_details?.card?.brand,
      } : undefined,
      nextRetryDate: invoice.next_payment_attempt ? 
        new Date(invoice.next_payment_attempt * 1000).toISOString() : undefined,
    }));
    
    // Calculate payment statistics
    const paidPayments = payments.filter(p => p.status === 'paid');
    const failedPayments = payments.filter(p => p.status === 'failed');
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFailed = failedPayments.reduce((sum, p) => sum + p.amount, 0);
    const successRate = payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 100;
    const averageAmount = paidPayments.length > 0 ? totalPaid / paidPayments.length : 0;
    
    // Mock next payment data - replace with actual subscription data
    const nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const nextPaymentAmount = 29; // This would come from the subscription
    
    const stats = {
      totalPaid,
      totalFailed,
      successRate,
      averageAmount,
      nextPaymentDate,
      nextPaymentAmount,
    };

    return NextResponse.json({
      payments,
      stats,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, paymentId } = await request.json();
    
    // TODO: Get user from session/auth
    const userId = 'user_123';
    const customerId = 'cus_123';
    
    switch (action) {
      case 'retry_payment':
        return await handleRetryPayment(paymentId);
      case 'download_invoice':
        return await handleDownloadInvoice(paymentId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing payment action:', error);
    return NextResponse.json(
      { error: 'Failed to process payment action' },
      { status: 500 }
    );
  }
}

async function handleRetryPayment(paymentId: string) {
  try {
    // TODO: Implement payment retry logic
    // This would typically involve:
    // 1. Get the failed invoice
    // 2. Attempt to collect payment again
    // 3. Update payment status
    
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Payment retry initiated',
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    throw error;
  }
}

async function handleDownloadInvoice(paymentId: string) {
  try {
    // TODO: Implement invoice download
    // This would typically involve:
    // 1. Get the invoice
    // 2. Generate or retrieve PDF
    // 3. Return download URL or file
    
    return NextResponse.json({
      success: true,
      downloadUrl: '/api/billing/invoice/download',
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
} 