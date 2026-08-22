const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

code = code.replace(/"?? Sesi percakapan Anda telah \*berakhir otomatis\* karena tidak ada aktivitas selama 5 menit.\r?\n\r?\nSilakan klik tombol \*Pilih Layanan\* pada menu utama untuk memulai kembali."/g, '`?? Sesi percakapan Anda telah *berakhir otomatis* karena tidak ada aktivitas selama 5 menit.\\n\\nSilakan klik tombol *Pilih Layanan* pada menu utama untuk memulai kembali.`');

fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
