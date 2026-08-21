const fs = require('fs');
let code = fs.readFileSync('src/app/actions/wa-subscribers.ts', 'utf8');
code = code.replace(/import \{ getSession \} from "@\/lib\/auth";/, 'import { getSession } from "@/app/actions/auth";');
fs.writeFileSync('src/app/actions/wa-subscribers.ts', code);
