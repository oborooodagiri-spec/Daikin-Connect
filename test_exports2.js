
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
console.log("=== exportProjectByStatusMatrix (full) ===");
const start = content.indexOf("export const exportProjectByStatusMatrix");
const end = content.indexOf("export const exportBookingForecastMatrix");
console.log(content.substring(start, end));

