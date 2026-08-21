const fs = require('fs');
let c = fs.readFileSync('src/app/reports/[type]/[id]/page.tsx', 'utf8');

c = c.replace(
  /const isUAL = uType\.includes\('UAL'\);/,
  "const uModel = (data.unit?.model || '').toUpperCase().trim();\n    const isUAL = uType.includes('UAL') || uModel.includes('UAL');"
);

fs.writeFileSync('src/app/reports/[type]/[id]/page.tsx', c);