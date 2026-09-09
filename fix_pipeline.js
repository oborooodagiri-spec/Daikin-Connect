const fs = require('fs');
let text = fs.readFileSync('src/app/actions/pipeline.ts', 'utf8');
text = text.replace(
  'if (!isAdminOrMgmt && existing.pic_id !== parseInt(session.userId) && existing.sales_planner !== session.name) {',
  'if (!isAdminOrMgmt && existing.pic_id !== parseInt(session.userId) && existing.sales_planner !== session.name && existing.pic?.toLowerCase() !== session.name.toLowerCase()) {'
);
fs.writeFileSync('src/app/actions/pipeline.ts', text);
