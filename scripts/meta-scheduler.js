const cron = require('node-cron');
const http = require('http');

console.log("Starting Meta WA Scheduler (API Trigger Mode)...");

cron.schedule('* * * * *', () => {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMin = now.getMinutes().toString().padStart(2, '0');
  
  console.log(`[${currentHour}:${currentMin}] Triggering internal Next.js API...`);
  
  const req = http.get('http://localhost:3000/api/v1/cron/scheduler', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`API Response: ${res.statusCode} - ${data}`);
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error calling Next.js API: ${e.message}`);
  });
});
