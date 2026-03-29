/**
 * Email Service powered by Resend
 * REPRO PLAN - Transactional email with verified domains
 */
import { Resend } from 'resend';
import { getEnv } from '../config/env';
import { createServiceLogger } from '../config/logger';

const log = createServiceLogger('email');

let resendClient: Resend | null = null;
let missingKeyLogged = false;

const DEFAULT_BRAND_LOGO =
  process.env.BRAND_LOGO_URL ||
  `${process.env.FRONTEND_URL || 'https://reproplanai.com'}/logo512.png`;

const buildUrl = (path: string): string => {
  const base = (getEnv().FRONTEND_URL || 'https://reproplanai.com').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export function wrapWithBrandOTP(otpCode: string, userName?: string, senderName = 'REPRO PLAN'): string {
  const userDisplayName = userName || 'there';
  const userFirstName = userDisplayName.split(' ')[0] || userDisplayName;
  const sendTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  log.info({ hasOtp: !!otpCode }, 'Sending OTP email');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 20px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                    <tr>
                        <td style="padding: 24px 20px 16px;">
                            <img src="${DEFAULT_BRAND_LOGO}" alt="REPRO PLAN" style="height: 32px; width: auto; max-width: 120px;" />
                            <span style="color: #65676B; font-size: 13px; float: right;">${sendTime}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 20px 24px;">
                            <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 12px;">Confirm it's you</h1>
                            <p style="color: #64748b; font-size: 16px; margin: 0 0 24px;">Hi ${userFirstName}, we're sending a security code to confirm it's really you.</p>
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center;">
                                <div style="color: #64748b; font-size: 14px; margin-bottom: 12px; text-transform: uppercase;">Your Security Code</div>
                                <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${otpCode}</div>
                                <p style="margin: 20px 0 0; color: #ef4444; font-size: 13px; font-weight: 600;">Don't share this code with anyone.</p>
                            </div>
                            <p style="margin: 0; color: #0f172a; font-size: 15px;">Thanks,<br><strong>${senderName} Security Team</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 24px 20px; border-top: 1px solid #E4E6EB;">
                            <p style="margin: 0; color: #65676B; font-size: 12px;">© ${new Date().getFullYear()} REPRO PLAN. <a href="https://reproplanai.com/help" style="color: #1877F2;">Help</a> | <a href="mailto:info@reproplan.com" style="color: #1877F2;">info@reproplan.com</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

function wrapWithBrand(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding: 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
        <tr><td style="padding: 24px 20px;"><img src="${DEFAULT_BRAND_LOGO}" alt="REPRO PLAN" style="height: 32px;" /></td></tr>
        <tr><td style="padding: 0 20px 24px;">${content}</td></tr>
        <tr><td align="center" style="padding: 24px; border-top: 1px solid #E4E6EB;">
          <p style="margin: 0; color: #65676B; font-size: 12px;">© ${new Date().getFullYear()} REPRO PLAN. <a href="https://reproplanai.com/help" style="color: #1877F2;">Help</a> | <a href="mailto:info@reproplan.com" style="color: #1877F2;">info@reproplan.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function getResendClient(): Resend | null {
  if (!resendClient) {
    const env = getEnv();
    if (!env.RESEND_API_KEY) {
      if (!missingKeyLogged) {
        log.error('RESEND_API_KEY not configured. Email sending DISABLED.');
        missingKeyLogged = true;
      }
      return null;
    }
    resendClient = new Resend(env.RESEND_API_KEY);
    log.info('Resend email client initialized');
  }
  return resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('Email sending failed: RESEND_API_KEY not configured.');
  }

  const env = getEnv();
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
  const fromAddress = options.from || env.EMAIL_FROM;

  log.info({ to: toAddresses, subject: options.subject }, 'Sending email');

  const isCompleteHtml = options.html.includes('<!DOCTYPE html>');
  const html = isCompleteHtml ? options.html : wrapWithBrand(options.html);
  const text = options.text || options.html.replace(/<[^>]*>/g, '');

  const response = await resend.emails.send({
    from: fromAddress,
    to: toAddresses,
    subject: options.subject,
    html,
    text,
  });

  if (response.error) {
    log.error({ err: response.error }, 'Email send failed');
    throw new Error(`Email sending failed: ${response.error.message}`);
  }
  log.info({ messageId: response.data?.id }, 'Email sent');
}

export async function sendOTPEmail(email: string, otpCode: string, userName?: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your REPRO PLAN Security Code',
    html: wrapWithBrandOTP(otpCode, userName),
  });
}

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
  const env = getEnv();
  const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - REPRO PLAN',
    html: `
      <h1 style="color:#0f172a;font-size:22px;">Confirm your email</h1>
      <p>Please confirm your email to continue using REPRO PLAN.</p>
      <a href="${verificationUrl}" style="display:inline-block;background:#1877F2;color:#fff;padding:14px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Confirm Email</a>
      <p style="color:#65676B;font-size:14px;margin-top:20px;">Or copy: ${verificationUrl}</p>
    `,
  });
}

export async function sendRecoveryEmail(email: string, instructions: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'REPRO PLAN - Recovery Instructions',
    html: `<h1 style="color:#0f172a;">Account Recovery</h1><p>${instructions}</p>`,
  });
}

export function isEmailServiceConfigured(): boolean {
  return getResendClient() !== null;
}
