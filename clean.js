const fs = require('fs');
let code = fs.readFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', 'utf8');

// Imports
code = code.replace(/,\s*QrCode\b/, '');
code = code.replace(/,\s*getWaBotStatus,\s*logoutWaBot\b/, '');
code = code.replace(/import dynamic from "next\/dynamic";\r?\n/, '');
code = code.replace(/const QRCode = dynamic[^\n]*\n/, '');

// States
code = code.replace(/const \[botStatus, setBotStatus\].*?\n/g, '');
code = code.replace(/const \[botQr, setBotQr\].*?\n/g, '');
code = code.replace(/const \[isLoggingOut, setIsLoggingOut\].*?\n/g, '');
code = code.replace(/\/\/ Bot Connection State\r?\n/g, '');

// useEffect polling
code = code.replace(/useEffect\(\(\) => \{\r?\n\s*let interval: NodeJS\.Timeout;[\s\S]*?return \(\) => clearInterval\(interval\);\r?\n\s*\}, \[showSettings, isAdmin\]\);\r?\n/, '');

// functions
code = code.replace(/const checkBotStatus = async \(\) => \{[\s\S]*?\};\r?\n/g, '');
code = code.replace(/const handleLogoutBot = async \(\) => \{[\s\S]*?\};\r?\n/g, '');

fs.writeFileSync('src/app/w/[projectId]/client/dashboard/OutstandingTab.tsx', code);
