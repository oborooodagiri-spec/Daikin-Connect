const fs = require('fs');
let c = fs.readFileSync('src/app/admin/database/DatabaseClient.tsx', 'utf8');

const newLink = "\n                    pathFiltered.push({\n                      id: 'auto-blank-ual',\n                      title: 'Blank Template - UAL',\n                      category: 'Reports',\n                      type: 'PDF (Auto)',\n                      href: '/reports/blank/preventive/UAL',\n                      tags: 'Preventive Maintenance, UAL',\n                      visibility: 'Internal',\n                      created_at: new Date().toISOString(),\n                    });";

c = c.replace(
  /pathFiltered\.push\(\{[\s\S]*?id: "auto-blank-uwap"[\s\S]*?\}\);/,
  "$&" + newLink
);

fs.writeFileSync('src/app/admin/database/DatabaseClient.tsx', c);