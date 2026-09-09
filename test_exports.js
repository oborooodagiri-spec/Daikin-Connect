
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
console.log("=== exportProjectByStatusMatrix ===");
console.log(content.substring(content.indexOf("export const exportProjectByStatusMatrix"), content.indexOf("export const exportProjectByStatusMatrix") + 1500));
console.log("\n=== exportCategoryMatrix ===");
console.log(content.substring(content.indexOf("export const exportCategoryMatrix"), content.indexOf("export const exportCategoryMatrix") + 1500));

