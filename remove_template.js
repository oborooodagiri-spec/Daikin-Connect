const fs = require('fs');
let code = fs.readFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', 'utf8');

// Remove Template from waSettings state
code = code.replace(/template:\s*data\?\.template \|\| "[^"]*"/, 'template: ""');

// Remove Template input UI completely
code = code.replace(/\{\/\* Template \*\/\}\s*<div.*?>[\s\S]*?<\/textarea>[\s\S]*?<\/div>/, '');

fs.writeFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', code);
