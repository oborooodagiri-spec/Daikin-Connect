
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
content = content.replace(/`  \?\?\? \$\{pic\}`/g, "`  \\u21B3 ${pic}`");
fs.writeFileSync("src/lib/excelExport.ts", content);

