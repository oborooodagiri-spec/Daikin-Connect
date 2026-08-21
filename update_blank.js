const fs = require('fs');
let c = fs.readFileSync('src/app/reports/blank/preventive/[unitType]/page.tsx', 'utf8');

c = c.replace(
  /import \{ getChillerPreventiveSections \} from "@\/components\/ChillerPreventivePDFTemplate";/,
  'import { getChillerPreventiveSections } from "@/components/ChillerPreventivePDFTemplate";\nimport { getUALPreventiveSections } from "@/components/UALPreventivePDFTemplate";'
);

c = c.replace(
  /if \(unitType === 'AHU'\) \{/,
  "if (unitType === 'UAL') {\n      sections = getUALPreventiveSections({ isBlank: true, ...dummyCommonApproval } as any, undefined, undefined, undefined, 'en');\n      title = 'PREVENTIVE MAINTENANCE UAL';\n    } else if (unitType === 'AHU') {"
);

fs.writeFileSync('src/app/reports/blank/preventive/[unitType]/page.tsx', c);