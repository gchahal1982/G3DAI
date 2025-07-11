export interface WelcomeEmailData {
  name: string;
  email: string;
  organizationName?: string;
  loginUrl: string;
}

export const WelcomeEmail = {
  subject: 'Welcome to AnnotateAI - Your Computer Vision Platform',
  
  html: (data: WelcomeEmailData): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AnnotateAI</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
        .content { padding: 40px 20px; }
        .welcome-title { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
        .welcome-text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .features { margin: 32px 0; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
        .feature-icon { width: 24px; height: 24px; background: #f0f9ff; border-radius: 6px; margin-right: 16px; display: flex; align-items: center; justify-content: center; color: #0284c7; font-weight: bold; }
        .feature-content h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937; }
        .feature-content p { margin: 0; font-size: 14px; color: #6b7280; }
        .footer { background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
        .social-links a { color: #6366f1; text-decoration: none; margin: 0 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AnnotateAI</div>
          <div class="tagline">Computer Vision Data Labeling Platform</div>
        </div>
        
        <div class="content">
          <h1 class="welcome-title">Welcome to AnnotateAI, ${data.name}! 🎉</h1>
          
          <p class="welcome-text">
            Thank you for joining AnnotateAI, the most advanced computer vision data labeling platform. 
            We're excited to help you build better AI models with our powerful annotation tools and 
            automated workflows.
          </p>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="cta-button">Get Started Now</a>
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">🎯</div>
              <div class="feature-content">
                <h4>Precision Annotation Tools</h4>
                <p>Professional-grade tools for bounding boxes, polygons, and semantic segmentation</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <div class="feature-content">
                <h4>AI-Powered Automation</h4>
                <p>Pre-annotation and quality assurance powered by state-of-the-art AI models</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">👥</div>
              <div class="feature-content">
                <h4>Team Collaboration</h4>
                <p>Real-time collaboration with role-based access and review workflows</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">📊</div>
              <div class="feature-content">
                <h4>Export Flexibility</h4>
                <p>Export to COCO, YOLO, Pascal VOC, and custom formats for any ML framework</p>
              </div>
            </div>
          </div>
          
          <p class="welcome-text">
            <strong>Next steps:</strong>
          </p>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>Complete your profile setup</li>
            <li>Create your first project</li>
            <li>Upload your dataset</li>
            <li>Start annotating with our intuitive tools</li>
          </ul>
          
          <p class="welcome-text">
            If you have any questions, our support team is here to help. Just reply to this email 
            or visit our help center.
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Need help? Contact us at support@annotateai.com or visit our 
            <a href="https://docs.annotateai.com" style="color: #6366f1;">documentation</a>.
          </p>
          
          <div class="social-links">
            <a href="#">Twitter</a> • 
            <a href="#">LinkedIn</a> • 
            <a href="#">GitHub</a>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
            © 2024 AnnotateAI. All rights reserved.<br>
            You received this email because you signed up for AnnotateAI.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  text: (data: WelcomeEmailData): string => `
    Welcome to AnnotateAI, ${data.name}!
    
    Thank you for joining AnnotateAI, the most advanced computer vision data labeling platform.
    
    Get started now: ${data.loginUrl}
    
    What you can do with AnnotateAI:
    • Use precision annotation tools for bounding boxes, polygons, and semantic segmentation
    • Leverage AI-powered automation for pre-annotation and quality assurance
    • Collaborate with your team in real-time with role-based access
    • Export to COCO, YOLO, Pascal VOC, and custom formats
    
    Next steps:
    1. Complete your profile setup
    2. Create your first project
    3. Upload your dataset
    4. Start annotating with our intuitive tools
    
    Need help? Contact us at support@annotateai.com or visit our documentation at https://docs.annotateai.com
    
    Best regards,
    The AnnotateAI Team
  `
};

export default WelcomeEmail; 