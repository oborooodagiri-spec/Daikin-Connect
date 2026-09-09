
const fs = require("fs");
const lines = fs.readFileSync("src/app/admin/database/logsheet-roesmin/LogsheetRoesminClient.tsx", "utf8").split("\n");
console.log(lines.slice(258, 280).join("\n"));

