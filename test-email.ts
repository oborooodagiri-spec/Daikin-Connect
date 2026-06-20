import { sendPasswordResetEmail } from './src/lib/mail';

async function test() {
  console.log("Testing email sending...");
  try {
     const res = await sendPasswordResetEmail('test@epllink.com', 'Test User', 'abc123token');
     console.log("Result:", res);
  } catch(e) {
     console.error(e);
  }
}
test();
