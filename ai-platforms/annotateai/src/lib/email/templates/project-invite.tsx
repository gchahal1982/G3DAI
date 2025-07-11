import React from 'react';

interface ProjectInviteEmailProps {
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  projectDescription: string;
  role: 'annotator' | 'reviewer' | 'admin' | 'viewer';
  organizationName: string;
  acceptUrl: string;
  declineUrl: string;
  projectUrl: string;
  expirationDate: string;
}

export default function ProjectInviteEmail({
  inviteeName,
  inviterName,
  inviterEmail,
  projectName,
  projectDescription,
  role,
  organizationName,
  acceptUrl,
  declineUrl,
  projectUrl,
  expirationDate
}: ProjectInviteEmailProps) {
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full project administration including settings, team management, and data export';
      case 'reviewer':
        return 'Review and approve annotations, manage quality control workflows';
      case 'annotator':
        return 'Create and edit annotations, collaborate with team members';
      case 'viewer':
        return 'View project progress and annotations (read-only access)';
      default:
        return 'Collaborate on this annotation project';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'reviewer': return '✅';
      case 'annotator': return '✏️';
      case 'viewer': return '👀';
      default: return '👥';
    }
  };

  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitation to join {projectName}</title>
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
          .content {
            padding: 32px;
          }
          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            margin: 8px;
          }
          .btn-secondary {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            margin: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .project-card {
            background: rgba(6, 182, 212, 0.1);
            border: 1px solid rgba(6, 182, 212, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          .role-badge {
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 8px;
            padding: 8px 16px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
            margin: 16px 0;
          }
          .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 24px 32px;
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      </head>
      <body>
        <div style={{ padding: '40px 20px', backgroundColor: '#0f172a' }}>
          <div className="container">
            {/* Header */}
            <div className="header">
              <div style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                👥
              </div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                Project Invitation
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.9 }}>
                You've been invited to collaborate
              </p>
            </div>

            {/* Main Content */}
            <div className="content">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Hi {inviteeName}! 👋
              </h2>
              
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join the 
                <strong> {projectName}</strong> project at <strong>{organizationName}</strong> on AnnotateAI.
              </p>

              {/* Project Details */}
              <div className="project-card">
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#06b6d4' }}>
                  📊 Project: {projectName}
                </h3>
                <p style={{ margin: '0 0 16px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}>
                  {projectDescription}
                </p>
                
                <div className="role-badge">
                  <span style={{ fontSize: '16px', marginRight: '8px' }}>{getRoleIcon(role)}</span>
                  Role: {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
                
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: '12px 0 0', lineHeight: '1.5' }}>
                  <strong>Your permissions:</strong> {getRoleDescription(role)}
                </p>
              </div>

              {/* Invitation Actions */}
              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Ready to start collaborating?
                </h3>
                
                <div style={{ margin: '24px 0' }}>
                  <a href={acceptUrl} className="btn-primary" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', margin: '8px' }}>
                    Accept Invitation
                  </a>
                  
                  <a href={declineUrl} className="btn-secondary" style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', textDecoration: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', margin: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    Decline
                  </a>
                </div>

                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: '16px 0' }}>
                  Or view the project directly: <a href={projectUrl} style={{ color: '#06b6d4' }}>View Project</a>
                </p>
              </div>

              {/* What to Expect */}
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '20px', margin: '32px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#6366f1' }}>
                  🚀 What you can expect:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <li style={{ marginBottom: '8px' }}>Access to professional annotation tools and AI assistance</li>
                  <li style={{ marginBottom: '8px' }}>Real-time collaboration with team members</li>
                  <li style={{ marginBottom: '8px' }}>Progress tracking and quality control workflows</li>
                  <li style={{ marginBottom: '8px' }}>Export capabilities in multiple formats (COCO, YOLO, etc.)</li>
                </ul>
              </div>

              {/* Inviter Info */}
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', margin: '24px 0' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  About your inviter:
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>
                    {inviterName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{inviterName}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>{inviterEmail}</div>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: '12px 0 0' }}>
                  You can contact {inviterName} directly if you have any questions about this project.
                </p>
              </div>

              {/* Expiration Notice */}
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '16px', margin: '24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>⏰</span>
                  <strong style={{ color: '#f59e0b' }}>Invitation expires on {new Date(expirationDate).toLocaleDateString()}</strong>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                  Please respond to this invitation before it expires. You can always be re-invited later if needed.
                </p>
              </div>

              <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '24px 0', color: 'rgba(255, 255, 255, 0.9)' }}>
                Need help getting started? Check out our 
                <a href="/help/collaboration" style={{ color: '#6366f1' }}> collaboration guide</a> or 
                contact our support team if you have any questions.
              </p>
            </div>

            {/* Footer */}
            <div className="footer">
              <p style={{ margin: '0 0 16px' }}>
                <strong>AnnotateAI</strong><br />
                Computer Vision Data Labeling Platform
              </p>
              
              <p style={{ fontSize: '12px', margin: '16px 0 0', opacity: 0.6 }}>
                This invitation was sent by {inviterName} ({inviterEmail}) from {organizationName}.<br />
                If you believe this invitation was sent in error, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

// Export HTML string version for email services
export function generateProjectInviteEmailHTML(props: ProjectInviteEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join ${props.projectName}</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
          .content { padding: 32px; }
          .btn-primary { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 8px; }
          .btn-secondary { display: inline-block; background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 8px; border: 1px solid rgba(255,255,255,0.2); }
          .footer { background: rgba(0,0,0,0.2); padding: 24px 32px; text-align: center; font-size: 14px; color: rgba(255,255,255,0.7); }
        </style>
      </head>
      <body>
        <div style="padding: 40px 20px;">
          <div class="container">
            <div class="header">
              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">👥</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Project Invitation</h1>
              <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">You've been invited to collaborate</p>
            </div>
            <div class="content">
              <h2>Hi ${props.inviteeName}! 👋</h2>
              <p><strong>${props.inviterName}</strong> has invited you to join the <strong>${props.projectName}</strong> project at <strong>${props.organizationName}</strong>.</p>
              <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #06b6d4; margin-bottom: 12px;">📊 ${props.projectName}</h3>
                <p style="margin-bottom: 16px;">${props.projectDescription}</p>
                <div style="background: rgba(99,102,241,0.2); border-radius: 8px; padding: 8px 16px; display: inline-block;">
                  Role: ${props.role.charAt(0).toUpperCase() + props.role.slice(1)}
                </div>
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${props.acceptUrl}" class="btn-primary">Accept Invitation</a>
                <a href="${props.declineUrl}" class="btn-secondary">Decline</a>
              </div>
              <p style="text-align: center; font-size: 14px; color: rgba(255,255,255,0.7);">
                Invitation expires on ${new Date(props.expirationDate).toLocaleDateString()}
              </p>
            </div>
            <div class="footer">
              <p><strong>AnnotateAI</strong><br>Computer Vision Data Labeling Platform</p>
              <p style="font-size: 12px; margin-top: 16px;">
                This invitation was sent by ${props.inviterName} from ${props.organizationName}.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
} 