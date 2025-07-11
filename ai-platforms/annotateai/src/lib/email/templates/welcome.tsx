import React from 'react';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  organizationName?: string;
  role: string;
  loginUrl: string;
  supportUrl: string;
  unsubscribeUrl: string;
}

export default function WelcomeEmail({
  userName,
  userEmail,
  organizationName,
  role,
  loginUrl,
  supportUrl,
  unsubscribeUrl
}: WelcomeEmailProps) {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to AnnotateAI</title>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #0f172a;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 32px;
            text-align: center;
          }
          .logo {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }
          .content {
            padding: 32px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            margin: 24px 0;
          }
          .feature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
          }
          .feature-item {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }
          .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 24px 32px;
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
          }
          .social-links {
            margin: 16px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .feature-grid {
              grid-template-columns: 1fr;
            }
            .content {
              padding: 24px;
            }
          }
        `}</style>
      </head>
      <body>
        <div style={{ padding: '40px 20px', backgroundColor: '#0f172a' }}>
          <div className="container">
            {/* Header */}
            <div className="header">
              <div className="logo">🎯</div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                Welcome to AnnotateAI
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }}>
                Computer Vision Data Labeling Platform
              </p>
            </div>

            {/* Main Content */}
            <div className="content">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Hi {userName}! 👋
              </h2>
              
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', color: 'rgba(255, 255, 255, 0.9)' }}>
                Welcome to AnnotateAI! We're excited to have you join us as a <strong>{role}</strong>
                {organizationName && ` at ${organizationName}`}. You're now part of the leading platform for 
                computer vision data annotation and AI model training.
              </p>

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '24px', margin: '24px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#6366f1' }}>
                  🚀 Ready to get started?
                </h3>
                <p style={{ margin: '0 0 16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Your account is ready and waiting. Click below to access your dashboard and start your first project.
                </p>
                <a href={loginUrl} className="btn" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: '600' }}>
                  Access Your Dashboard
                </a>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                What you can do with AnnotateAI:
              </h3>

              <div className="feature-grid">
                <div className="feature-item">
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>Precise Annotation</h4>
                  <p style={{ fontSize: '14px', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Professional tools for bounding boxes, polygons, and segmentation
                  </p>
                </div>

                <div className="feature-item">
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>AI Assistance</h4>
                  <p style={{ fontSize: '14px', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Speed up annotation with AI pre-labeling and smart suggestions
                  </p>
                </div>

                <div className="feature-item">
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>Team Collaboration</h4>
                  <p style={{ fontSize: '14px', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Work together with real-time collaboration and quality control
                  </p>
                </div>

                <div className="feature-item">
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>Analytics & Export</h4>
                  <p style={{ fontSize: '14px', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Track progress and export to COCO, YOLO, and other formats
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', padding: '20px', margin: '32px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#06b6d4' }}>
                  💡 Getting Started Tips
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <li style={{ marginBottom: '8px' }}>Complete your profile and organization settings</li>
                  <li style={{ marginBottom: '8px' }}>Create your first annotation project using our templates</li>
                  <li style={{ marginBottom: '8px' }}>Invite team members and set up collaboration workflows</li>
                  <li style={{ marginBottom: '8px' }}>Explore our help center for tutorials and best practices</li>
                </ul>
              </div>

              <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '24px 0', color: 'rgba(255, 255, 255, 0.9)' }}>
                Need help getting started? Our support team is here to help you succeed. 
                Visit our <a href={supportUrl} style={{ color: '#6366f1' }}>help center</a> or 
                reply to this email with any questions.
              </p>

              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <p style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>
                  Ready to build amazing AI models? 🚀
                </p>
                <a href={loginUrl} className="btn" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: '600' }}>
                  Start Annotating
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p style={{ margin: '0 0 16px' }}>
                <strong>AnnotateAI</strong><br />
                The Future of Computer Vision Data Labeling
              </p>
              
              <div className="social-links">
                <a href="https://twitter.com/annotateai" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>Twitter</a>
                <a href="https://linkedin.com/company/annotateai" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>LinkedIn</a>
                <a href="https://github.com/annotateai" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>GitHub</a>
                <a href={supportUrl} style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>Support</a>
              </div>

              <p style={{ fontSize: '12px', margin: '16px 0 0', opacity: 0.6 }}>
                You're receiving this email because you signed up for AnnotateAI.<br />
                <a href={unsubscribeUrl} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Unsubscribe</a> | 
                <a href="mailto:privacy@annotateai.com" style={{ color: 'rgba(255, 255, 255, 0.6)' }}> Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

// Export HTML string version for email services
export function generateWelcomeEmailHTML(props: WelcomeEmailProps): string {
  // This would be implemented with a React server-side renderer
  // For now, returning a simplified HTML template
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AnnotateAI</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
          .content { padding: 32px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; }
          .footer { background: rgba(0,0,0,0.2); padding: 24px 32px; text-align: center; font-size: 14px; color: rgba(255,255,255,0.7); }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎯</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to AnnotateAI</h1>
              <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Computer Vision Data Labeling Platform</p>
            </div>
            <div class="content">
              <h2>Hi ${props.userName}! 👋</h2>
              <p>Welcome to AnnotateAI! We're excited to have you join us as a <strong>${props.role}</strong>${props.organizationName ? ` at ${props.organizationName}` : ''}.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${props.loginUrl}" class="btn">Access Your Dashboard</a>
              </div>
              <p>Need help? Visit our <a href="${props.supportUrl}" style="color: #6366f1;">help center</a> or reply to this email.</p>
            </div>
            <div class="footer">
              <p><strong>AnnotateAI</strong><br>The Future of Computer Vision Data Labeling</p>
              <p style="font-size: 12px; margin-top: 16px;">
                <a href="${props.unsubscribeUrl}" style="color: rgba(255,255,255,0.6);">Unsubscribe</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
} 