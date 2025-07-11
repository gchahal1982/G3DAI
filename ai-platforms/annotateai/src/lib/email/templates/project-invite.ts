export interface ProjectInviteEmailData {
  inviteeName: string;
  inviterName: string;
  projectName: string;
  organizationName: string;
  inviteUrl: string;
  role: string;
}

export const ProjectInviteEmail = {
  subject: (data: ProjectInviteEmailData) => `You've been invited to join "${data.projectName}" on AnnotateAI`,
  
  html: (data: ProjectInviteEmailData): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation - AnnotateAI</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
        .content { padding: 40px 20px; }
        .invite-title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
        .invite-text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
        .project-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .project-name { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
        .project-details { font-size: 14px; color: #6b7280; }
        .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AnnotateAI</div>
          <div class="tagline">Computer Vision Data Labeling Platform</div>
        </div>
        
        <div class="content">
          <h1 class="invite-title">You've been invited to collaborate! 🚀</h1>
          
          <p class="invite-text">
            Hi ${data.inviteeName},<br><br>
            <strong>${data.inviterName}</strong> has invited you to join the annotation project 
            <strong>"${data.projectName}"</strong> at <strong>${data.organizationName}</strong>.
          </p>
          
          <div class="project-card">
            <div class="project-name">${data.projectName}</div>
            <div class="project-details">
              Organization: ${data.organizationName}<br>
              Invited by: ${data.inviterName}
            </div>
            <div class="role-badge">Role: ${data.role}</div>
          </div>
          
          <p class="invite-text">
            As a <strong>${data.role}</strong>, you'll be able to contribute to this computer vision 
            project using AnnotateAI's powerful annotation tools and collaborative features.
          </p>
          
          <div style="text-align: center;">
            <a href="${data.inviteUrl}" class="cta-button">Accept Invitation</a>
          </div>
          
          <p class="invite-text">
            This invitation will expire in 7 days. If you don't have an AnnotateAI account yet, 
            you'll be able to create one when you accept the invitation.
          </p>
          
          <p class="invite-text">
            Questions about this invitation? Contact <strong>${data.inviterName}</strong> or 
            reach out to our support team.
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Need help? Contact us at support@annotateai.com<br>
            © 2024 AnnotateAI. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  text: (data: ProjectInviteEmailData): string => `
    You've been invited to collaborate on AnnotateAI!
    
    Hi ${data.inviteeName},
    
    ${data.inviterName} has invited you to join the annotation project "${data.projectName}" at ${data.organizationName}.
    
    Project: ${data.projectName}
    Organization: ${data.organizationName}
    Your Role: ${data.role}
    Invited by: ${data.inviterName}
    
    Accept your invitation: ${data.inviteUrl}
    
    As a ${data.role}, you'll be able to contribute to this computer vision project using AnnotateAI's powerful annotation tools and collaborative features.
    
    This invitation will expire in 7 days. If you don't have an AnnotateAI account yet, you'll be able to create one when you accept the invitation.
    
    Questions? Contact ${data.inviterName} or reach out to support@annotateai.com
    
    Best regards,
    The AnnotateAI Team
  `
};

export default ProjectInviteEmail; 