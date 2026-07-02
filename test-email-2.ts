import { sendPasswordResetEmail, sendOtpEmail } from './src/lib/mail.ts';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("Testing OTP email...");
  const otpRes = await sendOtpEmail('admin@epllink.com', '123456');
  console.log("OTP result:", otpRes);

  console.log("Testing Password Reset email...");
  const resetRes = await sendPasswordResetEmail('admin@epllink.com', 'Test User', 'abc123token');
  console.log("Reset result:", resetRes);
}

test();
