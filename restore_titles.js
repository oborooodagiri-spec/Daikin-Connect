const fs = require('fs');

function replaceFile(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/'PREVENTIVE MAINTENANCE CHILLER'/g, "'PREVENTIVE MAINTENANCE UAL'");
  fs.writeFileSync(path, c);
}

replaceFile('src/app/reports/[type]/[id]/page.tsx');
replaceFile('src/app/passport/[token]/preventive/PreventiveFormClient.tsx');