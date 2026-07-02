/**
 * Professional Bilingual (Indonesian & English) Email Templates for EPL Link
 */

// Force using APP_URL to bypass sticky NEXT_PUBLIC build caches
const APP_URL = process.env.APP_URL || 'https://epllink.com';
const LOGO_URL = `${APP_URL}/logo_epllink.png`;

const baseStyles = `
  font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #334155;
  background-color: #f8fafc;
  margin: 0;
  padding: 40px 20px;
`;

const cardStyles = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const headerStyles = `
  background-color: #ffffff;
  padding: 30px 40px;
  text-align: center;
  border-bottom: 2px solid #f1f5f9;
`;

const contentStyles = `
  padding: 40px;
`;

const dividerStyles = `
  height: 1px;
  background-color: #e2e8f0;
  margin: 30px 0;
  border: none;
`;

const footerStyles = `
  background-color: #f8fafc;
  padding: 30px 40px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 28px;
  background-color: #00a1e4;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  margin: 24px 0;
  text-align: center;
`;

const otpContainerStyles = `
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin: 24px 0;
`;

const otpCodeStyles = `
  font-size: 32px;
  font-weight: 800;
  color: #0369a1;
  letter-spacing: 6px;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  white-space: nowrap;
`;

function getEmailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EPL Link Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="${baseStyles}">
        <div style="${cardStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #003366; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">EPL LINK</h1>
          </div>
          <div style="${contentStyles}">
            ${content}
          </div>
          <div style="${footerStyles}">
            <p style="margin: 0 0 10px 0;"><strong>EPL Link</strong> by Expanded Product Line of Service and Solution Division</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Daikin Applied Solution Indonesia</p>
            <p style="margin: 10px 0 0 0; font-size: 11px;">If you didn't request this email, please safely ignore it.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getVerificationCodeTemplate(code: string) {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Web Access Security</h2>
    <p style="color: #475569; margin-bottom: 20px;">Your login verification code is / Kode verifikasi login Anda adalah:</p>
    
    <div style="${otpContainerStyles}">
      <p style="${otpCodeStyles}">${code}</p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
  `;
  return getEmailWrapper(content);
}

export function getRegistrationReceivedTemplate(name: string) {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to EPL Link / Selamat Datang</h2>
    
    <p>Halo <strong>${name}</strong>,</p>
    <p>Terima kasih telah mendaftar di <strong>EPL Link</strong>. Permintaan akses Anda telah kami terima dan saat ini sedang dalam proses validasi oleh tim Admin kami.</p>
    <p>Mohon tunggu informasi selanjutnya melalui email ini jika akun Anda telah disetujui.</p>
    
    <hr style="${dividerStyles}">
    
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for registering with <strong>EPL Link</strong>. Your access request has been received and is currently being validated by our Admin team.</p>
    <p>Please wait for further information via email once your account has been approved.</p>
  `;
  return getEmailWrapper(content);
}

export function getAccountApprovedTemplate(name: string, role: string) {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #dcfce7; color: #166534; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
        Account Approved
      </div>
      <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Kabar Baik! / Good News!</h2>
    </div>
    
    <p>Halo <strong>${name}</strong>,</p>
    <p>Akun Anda telah <strong>disetujui</strong> dan kini sudah dapat digunakan dengan hak akses sebagai: <strong>${role}</strong>.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}" style="${buttonStyles}">Login ke Dashboard</a>
    </div>
    
    <hr style="${dividerStyles}">
    
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account has been <strong>approved</strong> and is now ready for use with the access role: <strong>${role}</strong>.</p>
  `;
  return getEmailWrapper(content);
}

export function getAccountSuspendedTemplate(name: string) {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background-color: #fee2e2; color: #991b1b; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px;">
        Account Suspended
      </div>
      <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Pemberitahuan / Notice</h2>
    </div>
    
    <p>Halo <strong>${name}</strong>,</p>
    <p>Kami memberitahukan bahwa akun Anda pada <strong>EPL Link</strong> telah <strong>ditangguhkan</strong> untuk sementara waktu.</p>
    <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi tim Admin kami untuk klarifikasi lebih lanjut.</p>
    
    <hr style="${dividerStyles}">
    
    <p>Hello <strong>${name}</strong>,</p>
    <p>We are informing you that your <strong>EPL Link</strong> account has been <strong>suspended</strong> temporarily.</p>
    <p>If you believe this is a mistake, please contact our Admin team for further clarification.</p>
  `;
  return getEmailWrapper(content);
}

export function getPasswordResetTemplate(name: string, resetLink: string) {
  const content = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Reset Password</h2>
    
    <p>Halo <strong>${name}</strong>,</p>
    <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
    
    <div style="text-align: center;">
      <a href="${resetLink}" style="${buttonStyles}">Atur Ulang Kata Sandi</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">Link ini akan kadaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
    
    <hr style="${dividerStyles}">
    
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset your account password. Click the button above to proceed.</p>
    <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you did not make this request, please safely ignore this email.</p>
  `;
  return getEmailWrapper(content);
}
