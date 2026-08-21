const fs = require('fs');
let c = fs.readFileSync('src/app/reports/blank/preventive/[unitType]/page.tsx', 'utf8');

c = c.replace(
  /\} else if \(unitType === "AHU" \|\| unitType\.includes\("AIR HANDLING UNIT"\)\) \{/,
  "} else if (unitType === 'UAL' || unitType.includes('UAL')) {\n    sections = getUALPreventiveSections(dummyData, dummyUnit, '', '');\n  } else if (unitType === \"AHU\" || unitType.includes(\"AIR HANDLING UNIT\")) {"
);

fs.writeFileSync('src/app/reports/blank/preventive/[unitType]/page.tsx', c);