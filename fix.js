const fs = require('fs');
let c = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

c = c.replace(
  'return false;\\n        if',
  'return false;\n        if'
);
c = c.replace(
  'return false;\\n        if',
  'return false;\n        if'
);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', c);
