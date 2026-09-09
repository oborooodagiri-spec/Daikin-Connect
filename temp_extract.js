
const fs = require("fs");
const content = fs.readFileSync("src/app/admin/live-data/DealFormModal.tsx", "utf8");
const start = content.indexOf("<select name=\"sales_planner\"");
const end = content.indexOf("</select>", start) + 9;
console.log(content.substring(start, end));

