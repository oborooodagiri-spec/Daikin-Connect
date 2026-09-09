
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
content = content.replace(/\? \" \: \"  \"/g, "? \" : \"  \"");
fs.writeFileSync("src/lib/excelExport.ts", content);

