
const { SignJWT } = require('jose');
async function run() {
  const secret = new TextEncoder().encode('daikin_connect_mobile_secret_key_2026_1555672274');
  const token = await new SignJWT({ userId: '4', name: 'Dede Yusuf Iskandar', roles: ['admin'] })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secret);
    
  const res = await Promise.all([
    fetch('http://localhost:3005/api/v1/pipeline/deals', { headers: { cookie: 'session=' + token } }).then(r=>r.json()),
    fetch('http://localhost:3005/api/v1/pipeline/ops', { headers: { cookie: 'session=' + token } }).then(r=>r.json()),
    fetch('http://localhost:3005/api/v1/pipeline/deals?type=leaderboard', { headers: { cookie: 'session=' + token } }).then(r=>r.json())
  ]);
  
  console.log('Deals count:', res[0].data?.length, 'Success:', res[0].success, 'Error:', res[0].error);
  console.log('Ops count:', res[1].data?.length, 'Success:', res[1].success, 'Error:', res[1].error);
  console.log('Leaderboard success:', res[2].success, 'Error:', res[2].error);
}
run().catch(console.error);

