const fs = require('fs');
let c = fs.readFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', 'utf8');

c = c.replace(
  /if \(type\.includes\("CHILLER"\) \|\| type\.includes\("WCP"\)\) \{/,
  "if (type.includes('UAL') || type.includes('CHILLER') || type.includes('WCP')) {"
);

c = c.replace(
  /const isChiller = uType\.includes\('CHILL'\) \|\| uType\.includes\('WCP'\);/,
  "const isUAL = uType.includes('UAL');\n    const isChiller = uType.includes('CHILL') || uType.includes('WCP');"
);

c = c.replace(
  /if \(isAHU\) \{/,
  "if (isUAL) {\n      const { getUALPreventiveSections } = await import('@/components/UALPreventivePDFTemplate');\n      sections = getUALPreventiveSections(finalRenderData, unit, engineerName, customerName, lang);\n      reportTitle = 'PREVENTIVE MAINTENANCE UAL';\n    } else if (isAHU) {"
);

fs.writeFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', c);