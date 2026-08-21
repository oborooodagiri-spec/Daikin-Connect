const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

// Update imports
if (!code.includes('sendWhatsAppInteractiveList')) {
  code = code.replace(/import \{ sendWhatsAppMessage \} from '@\/lib\/whatsapp';/, "import { sendWhatsAppMessage, sendWhatsAppInteractiveList } from '@/lib/whatsapp';");
}

// Modify POST handler to capture interactive messages
const oldMsgCheck = "if (msg.type === 'text') {";
const newMsgCheck = `
        if (msg.type === 'text') {
          await handleIncomingMessage(from, msg.text.body.trim());
        } else if (msg.type === 'interactive' && msg.interactive.type === 'list_reply') {
          // The user clicked a list item
          await handleIncomingMessage(from, msg.interactive.list_reply.id);
        }
`;
if (code.includes(oldMsgCheck)) {
  code = code.replace(oldMsgCheck, newMsgCheck.trim());
}

// Completely rewrite sendMenu to send an Interactive List
const oldSendMenuFunc = /async function sendMenu[\s\S]*?\}\s*async function handleUnsubscribe/m;
const newSendMenuFunc = `async function sendMenu(from: string) {
  const sections = [
    {
      title: "Layanan Laporan",
      rows: [
        { id: "DAFTAR", title: "Registrasi", description: "Daftar untuk menerima laporan otomatis" },
        { id: "STATUS", title: "Cek Outstanding", description: "Lihat status kasus saat ini" },
        { id: "BERHENTI", title: "Berhenti Langganan", description: "Cabut akses notifikasi proyek" }
      ]
    },
    {
      title: "Manajemen Kasus",
      rows: [
        { id: "TAMBAH", title: "Lapor Kasus Baru", description: "Tambahkan kasus baru ke sistem" },
        { id: "SELESAI", title: "Tandai Selesai", description: "Tandai kasus yang sudah beres" }
      ]
    }
  ];
  
  await sendWhatsAppInteractiveList(
    from, 
    "Main Menu", 
    "Selamat datang di *DSSI Connect*.\nSilakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:", 
    "? Pilih Layanan", 
    sections
  );
}

async function handleUnsubscribe`;

if (code.match(oldSendMenuFunc)) {
  code = code.replace(oldSendMenuFunc, newSendMenuFunc);
}

// Cleanup the old Number Mapping we just added
code = code.replace(/\/\/ Number mapping[\s\S]*?if \(command === "6"\) command = "BANTUAN";/m, '// Replaced with interactive list ID processing');

fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
