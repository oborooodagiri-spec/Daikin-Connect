import { sendAccountSuspendedEmail } from './src/lib/mail';

async function test() {
  console.log("Testing suspend email sending...");
  try {
     const res = await sendAccountSuspendedEmail('test@epllink.com', 'Test Suspend User');
     console.log("Result:", res);
  } catch(e) {
     console.error(e);
  }
}
test();
