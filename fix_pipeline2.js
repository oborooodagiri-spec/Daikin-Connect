const fs = require('fs');
let text = fs.readFileSync('src/app/actions/pipeline.ts', 'utf8');

text = text.replace(
  'export async function partialCloseDeal(id: number, closedAmount: number) {',
  'export async function partialCloseDeal(id: number, closedAmount: number, overrideFY?: string) {'
);

text = text.replace(
  'is_closed: true,\r\n          is_partial_close: true,',
  'is_closed: true,\n          closed_period: overrideFY || null,\n          is_partial_close: true,'
);
text = text.replace(
  'is_closed: true,\n          is_partial_close: true,',
  'is_closed: true,\n          closed_period: overrideFY || null,\n          is_partial_close: true,'
);

fs.writeFileSync('src/app/actions/pipeline.ts', text);
