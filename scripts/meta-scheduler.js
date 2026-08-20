const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const https = require('https');
const prisma = new PrismaClient();
require('dotenv').config();

async function sendMetaMessage(to, text) {
  const token = process.env.WA_ACCESS_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;

  let cleanTo = to.replace(/\D/g, "");
  if (cleanTo.startsWith("0")) {
    cleanTo = "62" + cleanTo.substring(1);
  }

  const data = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo,
    type: "text",
    text: { preview_url: false, body: text }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v19.0/${phoneId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });
    req.on('error', e => reject(e));
    req.write(data);
    req.end();
  });
}

async function runScheduler() {
  console.log("Starting Meta WA Scheduler...");
  
  // Clear any existing crons if we were doing dynamic scheduling
  // For simplicity, let's just run every minute and check if any project needs a message NOW
  
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMin}`;
    
    try {
      const projects = await prisma.projects.findMany({
        where: { wa_settings: { not: null } }
      });
      
      for (const project of projects) {
        if (!project.wa_settings) continue;
        let settings;
        try {
          settings = JSON.parse(project.wa_settings);
        } catch(e) { continue; }
        
        if (settings.schedules && settings.schedules.includes(currentTime)) {
          console.log(`[${currentTime}] Triggering Outstanding cases for Project: ${project.name}`);
          
          const pendingCases = await prisma.outstanding_cases.findMany({
            where: { project_id: project.id, status: "Pending" }
          });
          
          const completedCases = await prisma.outstanding_cases.findMany({
            where: { 
              project_id: project.id, 
              status: "Completed",
              updated_at: {
                gte: new Date(now.setHours(0,0,0,0))
              }
            }
          });

          if (pendingCases.length === 0) continue; // nothing to report

          let pendingStr = pendingCases.map((c, i) => `${i+1}. ${c.title} ${c.unit_name ? '('+c.unit_name+')' : ''}`).join('\n');
          let completedStr = completedCases.length > 0 ? completedCases.map((c, i) => `- ${c.title}`).join('\n') : "Belum ada case diselesaikan hari ini.";
          
          const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
          
          let template = settings.template || "";
          let message = template
            .replace('{{ProjectName}}', project.name || "Proyek")
            .replace('{{Date}}', dateStr)
            .replace('{{PendingList}}', pendingStr)
            .replace('{{CompletedList}}', completedStr);
            
          const numbers = settings.numbers || [];
          for (const num of numbers) {
            console.log(`Sending to ${num}...`);
            await sendMetaMessage(num, message);
          }
        }
      }
    } catch (e) {
      console.error("Scheduler error:", e);
    }
  });
}

runScheduler();
