
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
const start = content.indexOf("export const exportBookingForecastMatrix");
const end = content.indexOf("export const exportSectorMatrix");
console.log(content.substring(start, end));

