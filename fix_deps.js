const fs = require('fs');
let t = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');
t = t.replace('}, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter, projectStateFilter, \ncanClickWidgets, sessionName, sessionId]);', '}, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter, projectStateFilter, canClickWidgets, sessionName, sessionId, pipelineFYFilter]);');
t = t.replace('}, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter, projectStateFilter, \r\ncanClickWidgets, sessionName, sessionId]);', '}, [deals, searchTerm, statusFilter, categoryFilter, sectorFilter, picFilter, sourceFilter, projectStateFilter, canClickWidgets, sessionName, sessionId, pipelineFYFilter]);');
fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', t);
