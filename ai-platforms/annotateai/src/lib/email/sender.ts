import WelcomeEmail from './templates/welcome';
import ProjectInviteEmail from './templates/project-invite';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Email configuration
interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'nodemailer';
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    fromEmail: string;
    fromName: string;
  };
  nodemailer?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    fromEmail: string;
    fromName: string;
  };
}

// Default configuration
const defaultConfig: EmailConfig = {
  provider: 'sendgrid',
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@annotateai.com',
    fromName: process.env.FROM_NAME || 'AnnotateAI',
  },
};

export class EmailService {
  private config: EmailConfig;
  private nodemailerTransporter?: nodemailer.Transporter;

  constructor(config: EmailConfig = defaultConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize() {
    switch (this.config.provider) {
      case 'sendgrid':
        if (this.config.sendgrid?.apiKey) {
          sgMail.setApiKey(this.config.sendgrid.apiKey);
        }
        break;
      case 'nodemailer':
        if (this.config.nodemailer) {
          this.nodemailerTransporter = nodemailer.createTransporter({
            host: this.config.nodemailer.host,
            port: this.config.nodemailer.port,
            secure: this.config.nodemailer.secure,
            auth: this.config.nodemailer.auth,
          });
        }
        break;
    }
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(to, subject, html, text);
        case 'nodemailer':
          return await this.sendWithNodemailer(to, subject, html, text);
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendWithSendGrid(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.config.sendgrid) {
      throw new Error('SendGrid configuration not found');
    }

    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: this.config.sendgrid.fromEmail,
        name: this.config.sendgrid.fromName,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await sgMail.send(msg);
    return true;
  }

  private async sendWithNodemailer(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.nodemailerTransporter || !this.config.nodemailer) {
      throw new Error('Nodemailer configuration not found');
    }

    const mailOptions = {
      from: `${this.config.nodemailer.fromName} <${this.config.nodemailer.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    await this.nodemailerTransporter.sendMail(mailOptions);
    return true;
  }

  // Template-based email methods
  async sendWelcomeEmail(data: {
    to: string;
    name: string;
    email: string;
    organizationName?: string;
    loginUrl: string;
  }): Promise<boolean> {
    return await this.sendEmail(
      data.to,
      WelcomeEmail.subject,
      WelcomeEmail.html(data),
      WelcomeEmail.text(data)
    );
  }

  async sendProjectInviteEmail(data: {
    to: string;
    inviteeName: string;
    inviterName: string;
    projectName: string;
    organizationName: string;
    inviteUrl: string;
    role: string;
  }): Promise<boolean> {
    return await this.sendEmail(
      data.to,
      ProjectInviteEmail.subject(data),
      ProjectInviteEmail.html(data),
      ProjectInviteEmail.text(data)
    );
  }

  async sendPasswordResetEmail(data: {
    to: string;
    name: string;
    resetUrl: string;
  }): Promise<boolean> {
    const subject = 'Reset your AnnotateAI password';
    const html = `
      <h2>Password Reset Request</h2>
      <p>Hi ${data.name},</p>
      <p>You requested to reset your password for your AnnotateAI account.</p>
      <p><a href="${data.resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The AnnotateAI Team</p>
    `;
    
    return await this.sendEmail(data.to, subject, html);
  }

  async sendEmailVerificationEmail(data: {
    to: string;
    name: string;
    verificationUrl: string;
  }): Promise<boolean> {
    const subject = 'Verify your AnnotateAI email address';
    const html = `
      <h2>Email Verification</h2>
      <p>Hi ${data.name},</p>
      <p>Please verify your email address to complete your AnnotateAI account setup.</p>
      <p><a href="${data.verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The AnnotateAI Team</p>
    `;
    
    return await this.sendEmail(data.to, subject, html);
  }

  async sendBillingNotificationEmail(data: {
    to: string;
    name: string;
    type: 'payment_success' | 'payment_failed' | 'subscription_cancelled';
    amount?: number;
    nextBillingDate?: string;
  }): Promise<boolean> {
    let subject = '';
    let html = '';

    switch (data.type) {
      case 'payment_success':
        subject = 'Payment confirmation - AnnotateAI';
        html = `
          <h2>Payment Confirmed</h2>
          <p>Hi ${data.name},</p>
          <p>Your payment of $${data.amount} has been successfully processed.</p>
          <p>Next billing date: ${data.nextBillingDate}</p>
          <p>Thank you for using AnnotateAI!</p>
        `;
        break;
      case 'payment_failed':
        subject = 'Payment failed - AnnotateAI';
        html = `
          <h2>Payment Failed</h2>
          <p>Hi ${data.name},</p>
          <p>We were unable to process your payment of $${data.amount}.</p>
          <p>Please update your payment method in your account settings.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/settings/billing">Update Payment Method</a></p>
        `;
        break;
      case 'subscription_cancelled':
        subject = 'Subscription cancelled - AnnotateAI';
        html = `
          <h2>Subscription Cancelled</h2>
          <p>Hi ${data.name},</p>
          <p>Your AnnotateAI subscription has been cancelled.</p>
          <p>You can continue using your account until ${data.nextBillingDate}.</p>
          <p>We're sorry to see you go!</p>
        `;
        break;
    }

    return await this.sendEmail(data.to, subject, html);
  }
}

// Default email service instance
export const emailService = new EmailService();

export default EmailService; 