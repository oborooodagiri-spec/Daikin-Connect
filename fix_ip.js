const fs = require('fs');
let file = 'src/lib/security.ts';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  'ip_address: ipAddress,',
  'ip_address: ipAddress.substring(0, 45),'
);

fs.writeFileSync(file, text);
console.log("Fixed audit log IP length");
