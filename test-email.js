const { sendPasswordResetEmail } = require('./src/lib/mail');

async function test() {
  console.log("Testing email sending...");
  const res = await sendPasswordResetEmail('test@example.com', 'Test User', 'abc123token');
  console.log(res);
}
test();
