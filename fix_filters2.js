const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');
text = text.replace('const matchProjectState = ', 'const matchFY = pipelineFYFilter === "All" || getDealFYStr(d) === pipelineFYFilter;\n      const matchProjectState = ');
fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);
