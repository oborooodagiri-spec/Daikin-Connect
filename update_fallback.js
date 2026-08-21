const fs = require('fs');
let code = fs.readFileSync('src/app/api/v1/cron/scheduler/route.ts', 'utf8');

const searchRegex = /await sendWhatsAppTemplate\(num, "outstanding_report", \[param1, param2, param3, param4\], "en"\);/g;
const fallbackCode = `const templateSuccess = await sendWhatsAppTemplate(num, "outstanding_report", [param1, param2, param3, param4], "en");
          if (!templateSuccess) {
            console.log("[Cron] Template failed (likely pending approval). Falling back to standard text message for " + num);
            await sendWhatsAppMessage(num, message);
          }`;

code = code.replace(searchRegex, fallbackCode);
fs.writeFileSync('src/app/api/v1/cron/scheduler/route.ts', code);
