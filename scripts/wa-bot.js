const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { PrismaClient } = require('../src/generated/client_v3');
require('dotenv').config();

const prisma = new PrismaClient();
const targetNumber = process.env.WA_TARGET_NUMBER;

if (!targetNumber) {
  console.error("WA_TARGET_NUMBER is not set in .env!");
  process.exit(1);
}

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
});

client.on('ready', () => {
  console.log('WhatsApp Bot is READY!');
  
  // Format the target number to WA ID format
  // WA targets usually need to end with @c.us for individuals or @g.us for groups
  const formattedNumber = targetNumber.includes('@') ? targetNumber : `${targetNumber}@c.us`;
  
  // Test message on startup
  client.sendMessage(formattedNumber, '🤖 *Daikin Connect WA Bot Online*').catch(err => {
    console.error("Failed to send startup message:", err);
  });

  // Setup Cron Jobs
  setupCronJobs(formattedNumber);
});

client.on('authenticated', () => {
  console.log('WhatsApp Authenticated Successfully');
});

client.on('auth_failure', msg => {
  console.error('WhatsApp Authentication Failure', msg);
});

client.initialize();

// Helper to format date
const formatDate = (date) => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const sendChecklist = async (formattedNumber) => {
  console.log(`[${new Date().toISOString()}] Running WA Checklist Job...`);
  try {
    const projectId = 1n; // Plaza Indonesia
    const now = new Date();
    const isMorning = now.getHours() < 12;

    const outstandingCases = await prisma.outstanding_cases.findMany({
      where: {
        project_id: projectId,
        status: 'Pending'
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    if (outstandingCases.length === 0) {
      console.log("No outstanding cases. Skipping message.");
      return;
    }

    let message = `*OUTSTANDING CASE REPORT*\n`;
    message += `Proyek: Plaza Indonesia\n`;
    message += `Tanggal: ${formatDate(now)} (${isMorning ? 'Pagi' : 'Sore'})\n\n`;

    message += `*DAFTAR OUTSTANDING PENDING*:\n`;
    outstandingCases.slice(0, 15).forEach((c, idx) => {
      const unitName = c.unit_name ? `[${c.unit_name}] ` : "";
      message += `${idx + 1}. ${unitName}${c.title}\n`;
    });

    if (outstandingCases.length > 15) {
      message += `... dan ${outstandingCases.length - 15} kasus lainnya\n`;
    }
    
    message += `\n`;

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    const completedToday = await prisma.outstanding_cases.findMany({
      where: {
        project_id: projectId,
        status: 'Completed',
        updated_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (completedToday.length > 0) {
      message += `*DISELESAIKAN HARI INI*:\n`;
      completedToday.slice(0, 15).forEach((c, idx) => {
        const unitName = c.unit_name ? `[${c.unit_name}] ` : "";
        message += `${idx + 1}. ${unitName}${c.title}\n`;
      });
      if (completedToday.length > 15) {
        message += `... dan ${completedToday.length - 15} kasus lainnya\n`;
      }
      message += `\n`;
    }

    message += `Mohon kerja samanya untuk segera menyelesaikan case yang masih pending.\n`;
    message += `Pesan ini dikirim secara otomatis oleh Robot Daikin Connect.`;

    await client.sendMessage(formattedNumber, message);
    console.log("Checklist message sent successfully!");

  } catch (error) {
    console.error("Error generating/sending checklist:", error);
  }
};

const setupCronJobs = (formattedNumber) => {
  // 06:00 AM
  cron.schedule('0 6 * * *', () => {
    console.log('Running 06:00 WA Checklist');
    sendChecklist(formattedNumber);
  });

  // 18:00 PM
  cron.schedule('0 18 * * *', () => {
    console.log('Running 18:00 WA Checklist');
    sendChecklist(formattedNumber);
  });
  
  console.log("Cron jobs scheduled for 06:00 and 18:00.");
};
