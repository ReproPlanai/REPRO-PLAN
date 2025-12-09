import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@reproplan.app';
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const emailPayload: any = {
        from: this.fromEmail,
        to: data.to,
        subject: data.subject,
      };

      if (data.html) {
        emailPayload.html = data.html;
      }
      if (data.text) {
        emailPayload.text = data.text;
      }

      const { data: emailData, error } = await resend.emails.send(emailPayload);

      if (error) {
        console.error('Email send error:', error);
        return false;
      }

      console.log('Email sent successfully:', emailData?.id);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendRegistrationEmail(email: string, secretCode: string): Promise<boolean> {
    const subject = 'Welcome to REPRO PLAN - Your Secret Code';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to REPRO PLAN</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .code { font-size: 24px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; padding: 15px; background-color: white; border: 2px dashed #4F46E5; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>REPRO PLAN</h1>
              <p>Reproductive Health Rights Platform</p>
            </div>
            <div class="content">
              <h2>Welcome!</h2>
              <p>Thank you for registering with REPRO PLAN. Your account has been created successfully.</p>
              <p><strong>Your Secret Code:</strong></p>
              <div class="code">${secretCode}</div>
              <p>Please keep this code safe. You will need it to access your account and medical records.</p>
              <p>If you have any questions or need assistance, please contact our support team.</p>
              <p>Stay safe,<br>The REPRO PLAN Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 REPRO PLAN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to REPRO PLAN!

      Your Secret Code: ${secretCode}

      Please keep this code safe. You will need it to access your account and medical records.

      If you have any questions, please contact our support team.

      Stay safe,
      The REPRO PLAN Team
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordRecoveryEmail(email: string, recoveryLink: string): Promise<boolean> {
    const subject = 'REPRO PLAN - Password Recovery';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Recovery - REPRO PLAN</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>REPRO PLAN</h1>
              <p>Password Recovery</p>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your REPRO PLAN account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${recoveryLink}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${recoveryLink}">${recoveryLink}</a></p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Stay safe,<br>The REPRO PLAN Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 REPRO PLAN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      REPRO PLAN - Password Recovery

      We received a request to reset your password.

      Reset your password here: ${recoveryLink}

      This link will expire in 24 hours.

      If you didn't request this, please ignore this email.

      Stay safe,
      The REPRO PLAN Team
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendAlertNotification(email: string, alertData: any): Promise<boolean> {
    const subject = `REPRO PLAN Alert: ${alertData.alertType}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alert Notification - REPRO PLAN</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f9f9f9; }
            .alert-details { background-color: white; padding: 15px; border-left: 4px solid #DC2626; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 ALERT</h1>
              <p>REPRO PLAN Emergency Notification</p>
            </div>
            <div class="content">
              <h2>Emergency Alert</h2>
              <div class="alert-details">
                <p><strong>Type:</strong> ${alertData.alertType}</p>
                <p><strong>Priority:</strong> ${alertData.priority}</p>
                <p><strong>Description:</strong> ${alertData.description}</p>
                <p><strong>Location:</strong> ${alertData.location?.address || 'Location provided'}</p>
                <p><strong>Time:</strong> ${new Date(alertData.createdAt).toLocaleString()}</p>
              </div>
              <p>Please take appropriate action based on your role and the alert priority.</p>
              <p>Access the dashboard for more details and to coordinate response.</p>
              <p>Stay safe,<br>The REPRO PLAN Team</p>
            </div>
            <div class="footer">
              <p>This is an automated emergency notification.</p>
              <p>© 2024 REPRO PLAN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      REPRO PLAN ALERT: ${alertData.alertType}

      Type: ${alertData.alertType}
      Priority: ${alertData.priority}
      Description: ${alertData.description}
      Location: ${alertData.location?.address || 'Location provided'}
      Time: ${new Date(alertData.createdAt).toLocaleString()}

      Please take appropriate action based on your role and the alert priority.

      Stay safe,
      The REPRO PLAN Team
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }
}

export const emailService = new EmailService();
