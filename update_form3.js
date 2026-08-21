const fs = require('fs');
let c = fs.readFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', 'utf8');

c = c.replace(
  /const type = \(unitType \|\| ""\)\.toUpperCase\(\);/,
  "const type = (unitType || '').toUpperCase();\n  const model = (unit.model || '').toUpperCase();\n  const isModelUAL = model.includes('UAL');"
);

c = c.replace(
  /if \(type\.includes\('UAL'\) \|\| type\.includes\('CHILL'\) \|\| type\.includes\('WCP'\)\) \{/,
  "if (isModelUAL || type.includes('UAL') || type.includes('CHILL') || type.includes('WCP')) {"
);

c = c.replace(
  /const isUAL = unit\.unit_type\?\.toUpperCase\(\)\.includes\('UAL'\);/,
  "const isUAL = unit.unit_type?.toUpperCase().includes('UAL') || unit.model?.toUpperCase().includes('UAL');"
);

c = c.replace(
  /const hasPartsItems = !unit\.unit_type\?\.toUpperCase\(\)\.includes\('UAL'\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\('CHILL'\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\('WCP'\);/,
  "const hasPartsItems = !(unit.unit_type?.toUpperCase().includes('UAL') || unit.model?.toUpperCase().includes('UAL')) && !unit.unit_type?.toUpperCase().includes('CHILL') && !unit.unit_type?.toUpperCase().includes('WCP');"
);

c = c.replace(
  /\{!unit\.unit_type\?\.toUpperCase\(\)\.includes\('UAL'\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\('CHILL'\) && !unit\.unit_type\?\.toUpperCase\(\)\.includes\('WCP'\) && \(/,
  "{!(unit.unit_type?.toUpperCase().includes('UAL') || unit.model?.toUpperCase().includes('UAL')) && !unit.unit_type?.toUpperCase().includes('CHILL') && !unit.unit_type?.toUpperCase().includes('WCP') && ("
);

c = c.replace(
  /const isUAL = uType\.includes\('UAL'\);/,
  "const uModel = (unit.model || '').toUpperCase();\n    const isUAL = uType.includes('UAL') || uModel.includes('UAL');"
);

fs.writeFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', c);