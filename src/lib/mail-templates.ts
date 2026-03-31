/**
 * Bilingual (Indonesian & English) Email Templates for EPL Connect
 */

const baseStyles = `
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #334155;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
`;

const headerStyles = `
  padding-bottom: 20px;
  border-bottom: 2px solid #00a1e4;
  margin-bottom: 20px;
  text-align: center;
`;

const footerStyles = `
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #00a1e4;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin: 20px 0;
`;

export function getRegistrationReceivedTemplate(name: string) {
  return `
    <div style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="color: #003366; margin: 0;">EPL Connect</h1>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p>Halo <strong>${name}</strong>,</p>
        <p>Terima kasih telah mendaftar di <strong>EPL Connect</strong>. Permintaan akses Anda telah kami terima.</p>
        <p>Saat ini, akun Anda sedang dalam proses validasi oleh tim Admin kami. Mohon tunggu informasi selanjutnya melalui email ini jika akun Anda telah disetujui.</p>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with <strong>EPL Connect</strong>. Your access request has been received.</p>
        <p>Currently, your account is being validated by our Admin team. Please wait for further information via email once your account has been approved.</p>
      </div>

      <div style="${footerStyles}">
        <p>&copy; ${new Date().getFullYear()} EPL Connect - Daikin Applied Indonesia. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function getAccountApprovedTemplate(name: string, role: string) {
  return `
    <div style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="color: #003366; margin: 0;">EPL Connect</h1>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p>Halo <strong>${name}</strong>,</p>
        <p>Kabar baik! Akun Anda telah <strong>disetujui</strong> dan kini sudah dapat digunakan.</p>
        <p>Hak akses anda telah diatur sebagai: <strong>${role}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${buttonStyles}">Login ke Dashboard</a>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Good news! Your account has been <strong>approved</strong> and is now ready for use.</p>
        <p>Your access role has been set as: <strong>${role}</strong>.</p>
      </div>

      <div style="${footerStyles}">
        <p>&copy; ${new Date().getFullYear()} EPL Connect - Daikin Applied Indonesia. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function getAccountSuspendedTemplate(name: string) {
  return `
    <div style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="color: #003366; margin: 0;">EPL Connect</h1>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p>Halo <strong>${name}</strong>,</p>
        <p>Kami memberitahukan bahwa akun Anda pada <strong>EPL Connect</strong> telah <strong>ditangguhkan</strong> untuk sementara waktu.</p>
        <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi tim Admin kami untuk klarifikasi lebih lanjut.</p>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>We are informing you that your <strong>EPL Connect</strong> account has been <strong>suspended</strong> temporarily.</p>
        <p>If you believe this is a mistake, please contact our Admin team for further clarification.</p>
      </div>

      <div style="${footerStyles}">
        <p>&copy; ${new Date().getFullYear()} EPL Connect - Daikin Applied Indonesia. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function getPasswordResetTemplate(name: string, resetLink: string) {
  return `
    <div style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="color: #003366; margin: 0;">EPL Connect</h1>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p>Halo <strong>${name}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
        <a href="${resetLink}" style="${buttonStyles}">Atur Ulang Kata Sandi</a>
        <p>Link ini akan kadaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your account password. Click the button below to proceed:</p>
        <p>This link will expire in 1 hour. If you did not make this request, please ignore this email.</p>
      </div>

      <div style="${footerStyles}">
        <p>&copy; ${new Date().getFullYear()} EPL Connect - Daikin Applied Indonesia. All rights reserved.</p>
      </div>
    </div>
  `;
}
