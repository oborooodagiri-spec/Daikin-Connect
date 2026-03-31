import nodemailer from 'nodemailer';
import { 
  getRegistrationReceivedTemplate, 
  getAccountApprovedTemplate, 
  getAccountSuspendedTemplate, 
  getPasswordResetTemplate 
} from './mail-templates';

// Using Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'no-reply@daikin-connect.com',
    pass: process.env.SMTP_PASS || 'Doda4244@#',
  },
  tls: {
    // Allows sending with custom certificate chains (required by some environments/Hostinger)
    rejectUnauthorized: false
  }
});

const fromEmail = `"EPL Connect" <${process.env.SMTP_USER || 'no-reply@daikin-connect.com'}>`;

export async function sendRegistrationReceivedEmail(to: string, name: string) {
  console.log(`[MAIL] Attempting to send Registration Confirmation to ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: 'EPL Connect: Permintaan Akses Diterima / Access Request Received',
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
      to,
      subject: 'EPL Connect: Akun Disetujui / Account Approved',
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
      to,
      subject: 'EPL Connect: Akun Ditangguhkan / Account Suspended',
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
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: 'EPL Connect: Atur Ulang Kata Sandi / Password Reset',
      html: getPasswordResetTemplate(name, resetLink),
    });
    console.log(`[MAIL] Password Reset sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[MAIL] SMTP Error (Reset):', err);
    return { error: err };
  }
}
