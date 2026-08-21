const fs = require('fs');

function replaceFile(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/'PREVENTIVE MAINTENANCE UAL'/g, "'PREVENTIVE MAINTENANCE CHILLER'");
  fs.writeFileSync(path, c);
}

replaceFile('src/app/reports/[type]/[id]/page.tsx');
replaceFile('src/app/passport/[token]/preventive/PreventiveFormClient.tsx');
replaceFile('src/app/reports/blank/preventive/[unitType]/page.tsx');