const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');

// Fix the unterminated string constant
code = code.replace(/"Selamat datang di \*DSSI Connect\*\.\r?\nSilakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:"/, '`Selamat datang di *DSSI Connect*.\nSilakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:`');
code = code.replace(/"Selamat datang di \*DSSI Connect\*\.[\s\S]*?Silakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:"/, '`Selamat datang di *DSSI Connect*.\nSilakan pilih layanan yang ingin Anda gunakan dari menu di bawah ini:`');

fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', code, 'utf8');
