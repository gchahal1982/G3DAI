import React from 'react';

interface BillingInvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  planName: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  paymentMethod: string;
  downloadUrl: string;
  dashboardUrl: string;
}

export const BillingInvoiceEmail: React.FC<BillingInvoiceEmailProps> = ({
  customerName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  planName,
  amount,
  currency,
  billingPeriod,
  paymentMethod,
  downloadUrl,
  dashboardUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice #{invoiceNumber} - AnnotateAI</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 32px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .tagline {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 32px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
          }
          .invoice-info h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
            color: #1e293b;
          }
          .invoice-details {
            text-align: right;
            font-size: 14px;
            color: #64748b;
          }
          .invoice-details div {
            margin-bottom: 4px;
          }
          .billing-summary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
            border: 1px solid rgba(99, 102, 241, 0.15);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .summary-row:last-child {
            margin-bottom: 0;
            padding-top: 12px;
            border-top: 1px solid rgba(99, 102, 241, 0.2);
            font-weight: 600;
            font-size: 18px;
          }
          .plan-name {
            color: #6366f1;
            font-weight: 600;
          }
          .amount {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
          }
          .payment-info {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 32px;
          }
          .payment-info h3 {
            margin: 0 0 12px 0;
            color: #1e293b;
            font-size: 16px;
          }
          .payment-info p {
            margin: 4px 0;
            color: #64748b;
            font-size: 14px;
          }
          .cta-buttons {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
          }
          .btn {
            flex: 1;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s;
          }
          .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
          }
          .btn-secondary {
            background: white;
            color: #6366f1;
            border: 2px solid #6366f1;
          }
          .footer {
            background: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 16px;
          }
          .footer-links a {
            color: #6366f1;
            text-decoration: none;
            font-size: 14px;
          }
          .unsubscribe {
            color: #94a3b8;
            font-size: 12px;
          }
          .unsubscribe a {
            color: #94a3b8;
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 24px;
            }
            .header {
              padding: 24px;
            }
            .invoice-header {
              flex-direction: column;
              gap: 16px;
            }
            .invoice-details {
              text-align: left;
            }
            .cta-buttons {
              flex-direction: column;
            }
            .footer-links {
              flex-direction: column;
              gap: 12px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">AnnotateAI</div>
            <div className="tagline">Computer Vision Data Labeling</div>
          </div>
          
          <div className="content">
            <div className="invoice-header">
              <div className="invoice-info">
                <h2>Invoice #{invoiceNumber}</h2>
                <p>Thank you for your payment, {customerName}!</p>
              </div>
              <div className="invoice-details">
                <div><strong>Invoice Date:</strong> {invoiceDate}</div>
                <div><strong>Due Date:</strong> {dueDate}</div>
                <div><strong>Billing Period:</strong> {billingPeriod}</div>
              </div>
            </div>
            
            <div className="billing-summary">
              <div className="summary-row">
                <span>Plan:</span>
                <span className="plan-name">{planName}</span>
              </div>
              <div className="summary-row">
                <span>Billing Period:</span>
                <span>{billingPeriod}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="amount">{currency.toUpperCase()} ${amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="payment-info">
              <h3>Payment Confirmation</h3>
              <p>Your payment has been successfully processed and your AnnotateAI subscription is active.</p>
              <p>You'll continue to have access to all {planName} features throughout your billing period.</p>
            </div>
            
            <div className="cta-buttons">
              <a href={downloadUrl} className="btn btn-primary">
                Download Invoice
              </a>
              <a href={dashboardUrl} className="btn btn-secondary">
                View Dashboard
              </a>
            </div>
            
            <div style={{ marginTop: '32px', padding: '20px', background: '#f1f5f9', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}>
              <p><strong>Need help?</strong> Our support team is here to assist you:</p>
              <p>• Email: support@annotateai.com</p>
              <p>• Live Chat: Available in your dashboard</p>
              <p>• Documentation: docs.annotateai.com</p>
            </div>
          </div>
          
          <div className="footer">
            <div className="footer-text">
              Questions about your invoice? Contact our billing team at billing@annotateai.com
            </div>
            <div className="footer-links">
              <a href="https://annotateai.com/billing">Billing Portal</a>
              <a href="https://annotateai.com/support">Support Center</a>
              <a href="https://annotateai.com/docs">Documentation</a>
            </div>
            <div className="unsubscribe">
              <a href="#">Unsubscribe</a> from billing emails
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default BillingInvoiceEmail; 