const fs = require('fs');

let cronCode = fs.readFileSync('src/app/api/v1/cron/scheduler/route.ts', 'utf8');

// Update imports
if (!cronCode.includes('sendWhatsAppTemplate')) {
  cronCode = cronCode.replace(/import \{ sendWhatsAppMessage \} from '@\/lib\/whatsapp';/, "import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/whatsapp';");
}

// Replace the message building logic
const searchString = "let template = settings.template || \"\";";
const replaceString = `
        // TEMPLATE PARAMETERS: {{1}} Project, {{2}} Date, {{3}} Pending, {{4}} Completed
        const param1 = project.name || "Proyek";
        const param2 = dateStr;
        const param3 = pendingStr;
        const param4 = completedStr;
`;

if (cronCode.includes(searchString)) {
  // Remove the old message building
  cronCode = cronCode.replace(/let template = settings\.template[\s\S]*?\.replace\('\{\{CompletedList\}\}', completedStr\);/, replaceString);
}

// Replace the sending logic
const sendSearch = /await sendWhatsAppMessage\(num, message\);/g;
if (cronCode.match(sendSearch)) {
  cronCode = cronCode.replace(sendSearch, 'await sendWhatsAppTemplate(num, "outstanding_report", [param1, param2, param3, param4], "en");');
}

fs.writeFileSync('src/app/api/v1/cron/scheduler/route.ts', cronCode);
