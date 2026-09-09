
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
const start = content.indexOf("export const exportSectorMatrix");
const end = content.indexOf("export const exportHierarchyTree");
console.log(`Start: ${start}, End: ${end}`);

