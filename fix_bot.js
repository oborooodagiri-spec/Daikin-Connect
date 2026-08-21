const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

// Fix menu text (remove broken emojis, use professional brackets)
const newMenu = "Selamat datang di *DSSI Connect*.\n\nKetik salah satu perintah berikut:\n[1] *DAFTAR* - Registrasi penerima laporan\n[2] *STATUS* - Cek outstanding cases\n[3] *TAMBAH* - Lapor case baru\n[4] *SELESAI* - Tandai case selesai\n[5] *BERHENTI* - Cabut langganan\n[6] *BANTUAN* - Tampilkan menu ini";
code = code.replace(/const menu = ".*";/, `const menu = "${newMenu.replace(/\n/g, '\\n')}";`);

// Add number mapping
const mappingCode = `
  let command = text.toUpperCase().trim();
  
  // Number mapping
  if (command === "1") command = "DAFTAR";
  if (command === "2") command = "STATUS";
  if (command === "3") command = "TAMBAH";
  if (command === "4") command = "SELESAI";
  if (command === "5") command = "BERHENTI";
  if (command === "6") command = "BANTUAN";
  
  const session = sessions.get(from);
`;

code = code.replace(/const command = text\.toUpperCase\(\);\s*const session = sessions\.get\(from\);/, mappingCode);

fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
