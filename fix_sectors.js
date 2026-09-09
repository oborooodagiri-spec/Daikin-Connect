
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");

content = content.replace(
  "const sum = sectors.reduce((acc, sec) => acc + (root.children[sec]?.values[col.key] || 0), 0);",
  "const sum = statuses.reduce((acc, sec) => acc + (root.children[sec]?.values[col.key] || 0), 0);"
);

fs.writeFileSync("src/lib/excelExport.ts", content);

