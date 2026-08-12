const fs = require('fs');
let c = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

c = c.replace(
  'const pipelineModalDeals = activeDeals.filter(d => d.status !== \'B\');',
  'const pipelineModalDeals = activeDeals.filter(d => [\'C\', \'D\', \'E\', \'T\', \'H\'].includes(d.status));'
);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', c);
