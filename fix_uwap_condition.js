const fs = require('fs');
let c = fs.readFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', 'utf8');

c = c.replace(
  /if \(type\.includes\("UWAP"\)\) \{/,
  "if (type.includes('UWAP') && !isModelUAL && !type.includes('UAL')) {"
);

fs.writeFileSync('src/app/passport/[token]/preventive/PreventiveFormClient.tsx', c);