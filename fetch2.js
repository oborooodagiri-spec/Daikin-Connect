
const fs = require("fs");
const lines = fs.readFileSync("src/app/actions/logsheet_roesmin.ts", "utf8").split("\n");
console.log(lines.slice(0, 30).join("\n"));

