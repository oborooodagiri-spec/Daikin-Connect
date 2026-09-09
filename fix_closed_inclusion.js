const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

text = text.replace(
  /deals\.forEach\(d => \{\s*if \(d\.is_closed\) return;/g,
  'deals.forEach(d => {\n      if (d.is_closed && getDealFYStr(d) !== "FY" + selectedFY) return;'
);

text = text.replace(
  /leaderboardDeals\.forEach\(d => \{\s*if \(d\.is_closed\) return;/g,
  'leaderboardDeals.forEach(d => {\n      if (d.is_closed && getDealFYStr(d) !== "FY" + selectedFY) return;'
);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);
