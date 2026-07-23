
const { SignJWT } = require('jose');
async function run() {
  const secret = new TextEncoder().encode('daikin_connect_mobile_secret_key_2026_1555672274');
  const token = await new SignJWT({ userId: '4', name: 'Dede Yusuf Iskandar', roles: ['Admin'] })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secret);
    
  const res = await Promise.all([
    fetch('https://dconnect.id/api/v1/pipeline/deals', { headers: { cookie: 'session=' + token } }).then(r=>r.text()),
    fetch('https://dconnect.id/api/v1/pipeline/ops', { headers: { cookie: 'session=' + token } }).then(r=>r.text()),
    fetch('https://dconnect.id/api/v1/pipeline/deals?type=leaderboard', { headers: { cookie: 'session=' + token } }).then(r=>r.text())
  ]);
  
  console.log('Deals response:', res[0].substring(0, 500));
  console.log('Ops response:', res[1].substring(0, 100));
  console.log('Leaderboard response:', res[2].substring(0, 100));
}
run().catch(console.error);

