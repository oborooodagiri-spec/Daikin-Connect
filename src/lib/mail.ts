import nodemailer from 'nodemailer';
import { 
  getRegistrationReceivedTemplate, 
  getAccountApprovedTemplate, 
  getAccountSuspendedTemplate, 
  getPasswordResetTemplate,
  getVerificationCodeTemplate
} from './mail-templates';

// Using Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'no-reply@epllink.com',
    pass: process.env.SMTP_PASS || 'Onta12345@',
  },
  tls: {
    // Allows sending with custom certificate chains (required by some environments/Hostinger)
    rejectUnauthorized: false
  }
});

const fromEmail = `"EPL Link" <${process.env.SMTP_USER || 'no-reply@epllink.com'}>`;

export async function sendRegistrationReceivedEmail(to: string, name: string) {
  console.log(`[MAIL] Attempting to send Registration Confirmation to ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: 'admin@epllink.com',
      to,
      subject: 'EPL Link: Permintaan Akses Diterima / Access Request Received',
      html: getRegistrationReceivedTemplate(name),
    });
    console.log(`[MAIL] Registration Confirmation sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (Registration):', err);
    return { error: err };
  }
}

export async function sendAccountApprovedEmail(to: string, name: string, role: string) {
  console.log(`[MAIL] Attempting to send Approval Notification to ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: 'admin@epllink.com',
      to,
      subject: 'EPL Link: Akun Disetujui / Account Approved',
      html: getAccountApprovedTemplate(name, role),
    });
    console.log(`[MAIL] Approval Notification sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (Approval):', err);
    return { error: err };
  }
}

export async function sendAccountSuspendedEmail(to: string, name: string) {
  console.log(`[MAIL] Attempting to send Suspension Notification to ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: 'admin@epllink.com',
      to,
      subject: 'EPL Link: Akun Ditangguhkan / Account Suspended',
      html: getAccountSuspendedTemplate(name),
    });
    console.log(`[MAIL] Suspension Notification sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (Suspension):', err);
    return { error: err };
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  console.log(`[MAIL] Attempting to send Password Reset to ${to}...`);
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://epllink.com'}/reset-password/${resetToken}`;
    
    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: 'admin@epllink.com',
      to,
      subject: 'EPL Link: Atur Ulang Kata Sandi / Password Reset',
      html: getPasswordResetTemplate(name, resetLink),
    });
    console.log(`[MAIL] Password Reset sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (Reset):', err);
    return { error: err };
  }
}

export async function sendOtpEmail(to: string, otpCode: string) {
  const securityFrom = `"EPL Link Security" <${process.env.SMTP_USER || 'no-reply@epllink.com'}>`;
  console.log(`[MAIL] Attempting to send OTP to ${to} from ${securityFrom}...`);
  try {
    const info = await transporter.sendMail({
      from: securityFrom,
      to,
      subject: 'Security Verification Code - EPL Link',
      html: getVerificationCodeTemplate(otpCode),
    });
    console.log(`[MAIL] OTP sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (OTP):', err);
    return { error: err };
  }
}
