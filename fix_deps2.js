const fs = require('fs');
let t = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');
t = t.replace('canClickWidgets, sessionName, sessionId]);', 'canClickWidgets, sessionName, sessionId, pipelineFYFilter]);');
fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', t);
