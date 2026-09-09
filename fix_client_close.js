const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/LiveDataClient.tsx', 'utf8');

text = text.replace(
  'onFullClose={async (dealToClose) => {',
  'onFullClose={async (dealToClose, overrideFY) => {'
);

text = text.replace(
  'setDeals(prev => prev.map(d => d.id === dealToClose.id ? { ...d, is_closed: true } : d));',
  'setDeals(prev => prev.map(d => d.id === dealToClose.id ? { ...d, is_closed: true, closed_period: overrideFY || null } : d));'
);

text = text.replace(
  'const res = await updateDeal(dealToClose.id, { is_closed: true });',
  'const res = await updateDeal(dealToClose.id, { is_closed: true, closed_period: overrideFY || null });'
);

text = text.replace(
  'onPartialClose={async (dealToClose, amount) => {',
  'onPartialClose={async (dealToClose, amount, overrideFY) => {'
);

text = text.replace(
  'const res = await partialCloseDeal(dealToClose.id!, amount);',
  'const res = await partialCloseDeal(dealToClose.id!, amount, overrideFY);'
);

fs.writeFileSync('src/app/admin/live-data/LiveDataClient.tsx', text);
