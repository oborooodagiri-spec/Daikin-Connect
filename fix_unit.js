const fs = require('fs');
let c = fs.readFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', 'utf8');

c = c.replace(
  /const getScopeRows = \(unitType: string\) => \{[\s\S]*?const model = \(unit\.model \|\| ''\)\.toUpperCase\(\);/m,
  "const getScopeRows = (unitType: string, modelStr: string = '') => {\n  const type = (unitType || '').toUpperCase();\n  const model = modelStr.toUpperCase();"
);

c = c.replace(
  /const SCOPE_ROWS = getScopeRows\(unit\.unit_type\);/,
  "const SCOPE_ROWS = getScopeRows(unit.unit_type, unit.model || '');"
);

fs.writeFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', c);