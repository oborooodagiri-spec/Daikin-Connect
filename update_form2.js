const fs = require('fs');
let c = fs.readFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', 'utf8');

c = c.replace(
  /if \(type\.includes\("CHILL"\) \|\| type\.includes\("WCP"\)\) \{/,
  "if (type.includes('UAL') || type.includes('CHILL') || type.includes('WCP')) {"
);

c = c.replace(
  /const isChiller = unit\.unit_type\?\.toUpperCase\(\)\.includes\("CHILL"\) \|\| unit\.unit_type\?\.toUpperCase\(\)\.includes\("WCP"\);/,
  "const isUAL = unit.unit_type?.toUpperCase().includes('UAL');\n    const isChiller = unit.unit_type?.toUpperCase().includes('CHILL') || unit.unit_type?.toUpperCase().includes('WCP');"
);

c = c.replace(
  /if \(isAHU\) \{/,
  "if (isUAL) {\n      const { getUALPreventiveSections } = await import('@/components/UALPreventivePDFTemplate');\n      sections = getUALPreventiveSections(finalRenderData, unit, engineerName, customerName, lang);\n      reportTitle = 'PREVENTIVE MAINTENANCE UAL';\n    } else if (isAHU) {"
);

c = c.replace(
  /const hasPartsItems = !unit\.unit_type\?\.toUpperCase\(\)\.includes\("CHILL"\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\("WCP"\);/,
  "const hasPartsItems = !unit.unit_type?.toUpperCase().includes('UAL') && !unit.unit_type?.toUpperCase().includes('CHILL') && !unit.unit_type?.toUpperCase().includes('WCP');"
);

c = c.replace(
  /\{!unit\.unit_type\?\.toUpperCase\(\)\.includes\("CHILL"\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\("WCP"\) && \(/,
  "{!unit.unit_type?.toUpperCase().includes('UAL') && !unit.unit_type?.toUpperCase().includes('CHILL') && !unit.unit_type?.toUpperCase().includes('WCP') && ("
);

fs.writeFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', c);