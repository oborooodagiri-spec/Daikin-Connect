const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

// Replace sessions Map initialization
const oldMap = "const sessions = new Map<string, any>();";
const newMap = `
interface SessionData {
  step: string;
  timeoutId?: NodeJS.Timeout;
  [key: string]: any;
}

const sessions = new Map<string, SessionData>();

function setSessionTimeout(from: string, data: any) {
  const existing = sessions.get(from);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }
  
  const timeoutId = setTimeout(async () => {
    sessions.delete(from);
    try {
      await sendWhatsAppMessage(from, "?? Sesi percakapan Anda telah *berakhir otomatis* karena tidak ada aktivitas selama 5 menit.\n\nSilakan klik tombol *Pilih Layanan* pada menu utama untuk memulai kembali.");
    } catch (e) { console.error(e); }
  }, 5 * 60 * 1000);

  sessions.set(from, { ...data, timeoutId });
}

function clearSession(from: string) {
  const existing = sessions.get(from);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }
  sessions.delete(from);
}
`;

code = code.replace(oldMap, newMap);

// Replace sessions.set with setSessionTimeout and sessions.delete with clearSession
code = code.replace(/sessions\.set\(from,\s*/g, "setSessionTimeout(from, ");
code = code.replace(/sessions\.delete\(from\)/g, "clearSession(from)");

fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
