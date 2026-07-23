const cron = require('node-cron');
const https = require('https');
const http = require('http');

require('dotenv').config();

const cronSecret = process.env.CRON_SECRET || 'secret123';
// Adjust the port if your app runs on a different port
const appUrl = `http://localhost:3000/api/cron/wa-checklist?secret=${cronSecret}`;

console.log('WA Cron scheduler started. Will trigger at 06:00 and 18:00 every day.');

const triggerChecklist = () => {
  console.log(`[${new Date().toISOString()}] Triggering WA Checklist...`);
  
  const req = http.get(appUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response: ${res.statusCode} - ${data}`);
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error triggering cron: ${e.message}`);
  });
};

// Schedule for 06:00
cron.schedule('0 6 * * *', () => {
  console.log('Running 06:00 WA Checklist');
  triggerChecklist();
});

// Schedule for 18:00
cron.schedule('0 18 * * *', () => {
  console.log('Running 18:00 WA Checklist');
  triggerChecklist();
});
