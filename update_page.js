const fs = require('fs');
let c = fs.readFileSync('src/app/reports/[type]/[id]/page.tsx', 'utf8');

c = c.replace(
  /import \{ getChillerPreventiveSections \} from "@\/components\/ChillerPreventivePDFTemplate";/,
  'import { getChillerPreventiveSections } from "@/components/ChillerPreventivePDFTemplate";\nimport { getUALPreventiveSections } from "@/components/UALPreventivePDFTemplate";'
);

c = c.replace(
  /const isChiller = uType\.includes\('CHILL'\) \|\| uType\.includes\('WCP'\);/,
  "const isUAL = uType.includes('UAL');\n    const isChiller = uType.includes('CHILL') || uType.includes('WCP');"
);

c = c.replace(
  /if \(isAHU\) \{/,
  "if (isUAL) {\n      reportTitle = activityData.reportTitle || 'PREVENTIVE MAINTENANCE UAL';\n      sections = getUALPreventiveSections({...activityData, ...commonApproval}, data.unit, data.activity.inspector_name, data.customer?.name, activeLang);\n    } else if (isAHU) {"
);

fs.writeFileSync('src/app/reports/[type]/[id]/page.tsx', c);