const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/generated/client_v3');
require('dotenv').config();

const statusFilePath = path.join(__dirname, '../public/wa-status.json');

const updateStatus = (status, qrString = "", command = "") => {
  try {
    const dir = path.dirname(statusFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(statusFilePath, JSON.stringify({
      status,
      qr_string: qrString,
      command,
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.error("Failed to write wa-status.json", err);
  }
};

// Initialize with DISCONNECTED status
updateStatus("DISCONNECTED");

const prisma = new PrismaClient();

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on('qr', (qr) => {
  console.log('SCAN THE QR CODE BELOW TO CONNECT WHATSAPP:');
  qrcode.generate(qr, { small: true });
  updateStatus("QR", qr);
});

client.on('ready', () => {
  console.log('WhatsApp Bot is READY!');
  updateStatus("READY");
  
  // Setup Cron Jobs
  setupCronJobs();
});

client.on('authenticated', () => {
  console.log('WhatsApp Authenticated Successfully');
});

client.on('auth_failure', msg => {
  console.error('WhatsApp Authentication Failure', msg);
  updateStatus("DISCONNECTED");
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp Disconnected:', reason);
  updateStatus("DISCONNECTED");
});

client.initialize();

// Poll for LOGOUT command
setInterval(async () => {
  try {
    if (fs.existsSync(statusFilePath)) {
      const data = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
      if (data.command === "LOGOUT") {
        console.log("Received LOGOUT command from UI. Logging out...");
        updateStatus("DISCONNECTED");
        await client.logout();
        fs.rmSync(path.join(__dirname, '../.wwebjs_auth'), { recursive: true, force: true });
        console.log("Session cleared. Restarting process...");
        process.exit(1); // Exit so PM2 can restart it and generate fresh QR
      }
    }
  } catch (err) {
    // ignore polling errors
  }
}, 3000);

// Helper to format date
const formatDate = (date) => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const sendChecklist = async () => {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  try {
    const projectsWithWA = await prisma.projects.findMany({
      where: {
        wa_settings: {
          not: null
        }
      }
    });

    if (projectsWithWA.length === 0) {
      return;
    }

    const now = new Date();
    const isMorning = now.getHours() < 12;

    for (const project of projectsWithWA) {
      let waSettings = {};
      if (typeof project.wa_settings === 'string') {
        try { waSettings = JSON.parse(project.wa_settings); } catch (e) {}
      } else {
        waSettings = project.wa_settings;
      }
      
      const schedules = waSettings?.schedules || [];
      if (!schedules.includes(currentTime)) {
        continue;
      }
      
      console.log(`[${new Date().toISOString()}] Running WA Checklist for ${project.name} at ${currentTime}`);

      const outstandingCases = await prisma.outstanding_cases.findMany({
        where: {
          project_id: project.id,
          status: 'Pending'
        },
        orderBy: {
          created_at: 'asc'
        }
      });

      let pendingList = "";
      if (outstandingCases.length === 0) {
        pendingList = "Tidak ada kasus pending.";
      } else {
        outstandingCases.slice(0, 15).forEach((c, idx) => {
          const unitName = c.unit_name ? `[${c.unit_name}] ` : "";
          pendingList += `${idx + 1}. ${unitName}${c.title}\n`;
        });
        if (outstandingCases.length > 15) {
          pendingList += `... dan ${outstandingCases.length - 15} kasus lainnya\n`;
        }
      }

      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date();
      endOfDay.setHours(23,59,59,999);
      
      const completedToday = await prisma.outstanding_cases.findMany({
        where: {
          project_id: project.id,
          status: 'Completed',
          updated_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      let completedList = "";
      if (completedToday.length === 0) {
        completedList = "-";
      } else {
        completedToday.slice(0, 15).forEach((c, idx) => {
          const unitName = c.unit_name ? `[${c.unit_name}] ` : "";
          completedList += `${idx + 1}. ${unitName}${c.title}\n`;
        });
        if (completedToday.length > 15) {
          completedList += `... dan ${completedToday.length - 15} kasus lainnya\n`;
        }
      }

      let template = waSettings?.template || "*OUTSTANDING CASE REPORT*\nProyek: {{ProjectName}}\nTanggal: {{Date}}\n\n*DAFTAR OUTSTANDING PENDING*:\n{{PendingList}}\n\n*DISELESAIKAN HARI INI*:\n{{CompletedList}}\nMohon kerja samanya untuk segera menyelesaikan case yang masih pending.\nPesan ini dikirim secara otomatis oleh Robot Daikin Connect.";
      
      const isMorning = now.getHours() < 12;
      const dateStr = `${formatDate(now)} (${isMorning ? 'Pagi' : 'Sore'})`;
      
      let message = template
        .replace(/\{\{ProjectName\}\}/g, project.name)
        .replace(/\{\{Date\}\}/g, dateStr)
        .replace(/\{\{PendingList\}\}/g, pendingList)
        .replace(/\{\{CompletedList\}\}/g, completedList);

      const targets = [
        ...(waSettings?.numbers || []).map(t => (t.includes('@') ? t : `${t}@c.us`)),
        ...(waSettings?.groups || []).map(t => (t.includes('@') ? t : `${t}@g.us`))
      ];
      
      for (const target of targets) {
        try {
          await client.sendMessage(target, message);
          console.log(`Sent to ${target} for project ${project.name}`);
        } catch (sendErr) {
          console.error(`Failed to send to ${target}:`, sendErr);
        }
      }
    }

    console.log("Checklist job completed successfully!");

  } catch (error) {
    console.error("Error generating/sending checklist:", error);
  }
};

const setupCronJobs = () => {
  // Check every minute
  cron.schedule('* * * * *', () => {
    sendChecklist();
  });
  
  console.log("Dynamic Cron master scheduled to check every minute.");
};
