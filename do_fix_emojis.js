const fs = require('fs');

let actionsCode = fs.readFileSync('src/app/actions/outstanding.ts', 'utf8');
actionsCode = actionsCode.replace(/\?\? \*NEW OUTSTANDING CASE\*/g, '[NEW OUTSTANDING CASE]');
actionsCode = actionsCode.replace(/\? \*CASE RESOLVED\*/g, '[CASE RESOLVED]');
fs.writeFileSync('src/app/actions/outstanding.ts', actionsCode, 'utf8');

let routeCode = fs.readFileSync('src/app/api/v1/webhook/whatsapp/route.ts', 'utf8');
routeCode = routeCode.replace(/\? Select Service/g, 'Select Service');
routeCode = routeCode.replace(/\? Select Project/g, 'Select Project');
routeCode = routeCode.replace(/\? Select Feature/g, 'Select Feature');
routeCode = routeCode.replace(/\? Select Action/g, 'Select Action');
// Just in case there are any ? Pilih Layanan (from image)
routeCode = routeCode.replace(/\? Pilih Layanan/g, 'Select Service');
fs.writeFileSync('src/app/api/v1/webhook/whatsapp/route.ts', routeCode, 'utf8');
