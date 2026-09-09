
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
const start = content.indexOf("export const exportProjectByStatusMatrix");
const end = content.indexOf("export const exportCategoryMatrix");
console.log(content.substring(start, end));

