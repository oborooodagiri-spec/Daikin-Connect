// Script untuk menulis file .env yang benar di server
// Jalankan: node fix_env.js

const fs = require('fs');
const path = require('path');

const envContent = [
  'DATABASE_URL="mysql://u534185630_EPLConnect:Yw3%219t%23Qp7z2Lk8%40Dq@153.92.15.71:3306/u534185630_DASIConnect"',
  'JWT_SECRET="daikin_connect_mobile_secret_key_2026_1555672274"',
  'NEXT_PUBLIC_APP_URL="https://daikin-connect.com"',
  'SMTP_HOST="smtp.hostinger.com"',
  'SMTP_PORT="465"',
  'SMTP_USER="no-reply@daikin-connect.com"',
  'SMTP_PASS="Doda4244@#"',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL="daikin-sync-agent@eplconnect.iam.gserviceaccount.com"',
  'GOOGLE_DRIVE_FOLDER_ID="1g851qMlsM7WiHco3bVm16wXkZa3UyjOH"',
].join('\n') + '\n';

const envPath = path.join(__dirname, '.env');

// Hapus file lama jika ada
if (fs.existsSync(envPath)) {
  fs.unlinkSync(envPath);
  console.log('✓ File .env lama dihapus');
}

// Tulis file baru
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✓ File .env baru berhasil ditulis');

// Verifikasi
const written = fs.readFileSync(envPath, 'utf8');
console.log('\n--- Isi .env ---');
console.log(written);
console.log('--- End ---');

// Cek apakah DATABASE_URL valid
const dbUrl = written.split('\n')[0].split('=').slice(1).join('=').replace(/"/g, '');
if (dbUrl.startsWith('mysql://')) {
  console.log('\n✅ DATABASE_URL valid! Dimulai dengan mysql://');
} else {
  console.log('\n❌ DATABASE_URL TIDAK VALID! Nilainya:', dbUrl);
}
