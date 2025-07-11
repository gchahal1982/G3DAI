import React from 'react';

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expirationTime: string;
  userAgent: string;
  ipAddress: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
  expirationTime,
  userAgent,
  ipAddress,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password - AnnotateAI</title>
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
          .security-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            text-align: center;
            margin-bottom: 16px;
          }
          .subtitle {
            font-size: 16px;
            color: #64748b;
            text-align: center;
            margin-bottom: 32px;
          }
          .reset-button {
            display: block;
            width: 100%;
            max-width: 300px;
            margin: 0 auto 32px;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
          }
          .expiration-notice {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 32px;
            text-align: center;
          }
          .expiration-notice .icon {
            font-size: 20px;
            margin-bottom: 8px;
          }
          .security-info {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 32px;
          }
          .security-info h3 {
            margin: 0 0 12px 0;
            color: #1e293b;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .security-info p {
            margin: 4px 0;
            color: #64748b;
            font-size: 14px;
          }
          .security-details {
            background: #f1f5f9;
            border-radius: 6px;
            padding: 12px;
            margin-top: 12px;
            font-size: 12px;
            color: #64748b;
          }
          .security-details div {
            margin-bottom: 4px;
          }
          .security-details div:last-child {
            margin-bottom: 0;
          }
          .alternative-link {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 32px;
            word-break: break-all;
            font-size: 14px;
            color: #64748b;
          }
          .alternative-link strong {
            color: #1e293b;
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
            <div className="security-icon">
              🔒
            </div>
            
            <h1 className="title">Reset Your Password</h1>
            <p className="subtitle">
              Hi {userName}, we received a request to reset your password for your AnnotateAI account.
            </p>
            
            <a href={resetLink} className="reset-button">
              Reset Password
            </a>
            
            <div className="expiration-notice">
              <div className="icon">⏰</div>
              <strong>This link expires in {expirationTime}</strong>
              <p>For security reasons, this password reset link will expire soon.</p>
            </div>
            
            <div className="security-info">
              <h3>
                🛡️ Security Information
              </h3>
              <p>This password reset request was made from:</p>
              <div className="security-details">
                <div><strong>Browser:</strong> {userAgent}</div>
                <div><strong>IP Address:</strong> {ipAddress}</div>
                <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
              </div>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                If you didn't request this password reset, please ignore this email and contact our support team immediately.
              </p>
            </div>
            
            <div className="alternative-link">
              <strong>Can't click the button?</strong> Copy and paste this link into your browser:
              <br />
              <span style={{ color: '#6366f1', marginTop: '8px', display: 'block' }}>{resetLink}</span>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
              <strong>Didn't request this?</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                If you didn't request a password reset, your account may be at risk. 
                Please contact our security team immediately at security@annotateai.com
              </p>
            </div>
          </div>
          
          <div className="footer">
            <div className="footer-text">
              Need help? Our support team is available 24/7 at support@annotateai.com
            </div>
            <div className="footer-links">
              <a href="https://annotateai.com/support">Support Center</a>
              <a href="https://annotateai.com/security">Security</a>
              <a href="https://annotateai.com/docs">Documentation</a>
            </div>
            <div className="unsubscribe">
              You cannot unsubscribe from security-related emails
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PasswordResetEmail; 