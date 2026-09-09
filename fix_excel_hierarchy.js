
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");

// Fix exportCategoryMatrix (Pipeline)
let catExportStart = content.indexOf("export const exportCategoryMatrix");
let catPathStart = content.indexOf("const path = [", catExportStart);
let catPathEnd = content.indexOf("];", catPathStart) + 2;

let newCatPath = `const allowedStatuses = ["C", "D", "E"];
    if (!allowedStatuses.includes(d.status)) return;

    const path = [
      d.status || "Unknown Status",
      d.pic || "Unassigned",
      d.category || "Others",
      \`   - \${d.client_name || "Unknown Customer"} \\n(\${d.project_name || "Unknown Project"})\`
    ];`;

content = content.substring(0, catPathStart) + newCatPath + content.substring(catPathEnd);

// Fix exportSectorMatrix (Industry / Commercial)
let secExportStart = content.indexOf("export const exportSectorMatrix");
let secPathStart = content.indexOf("const path = [", secExportStart);
let secPathEnd = content.indexOf("];", secPathStart) + 2;

let newSecPath = `const allowedStatuses = ["A", "B", "C", "D", "E"];
    if (!allowedStatuses.includes(d.status)) return;

    const path = [
      d.status || "Unknown Status",
      d.pic || "Unassigned",
      d.category || "Others",
      \`   - \${d.client_name || "Unknown Customer"} \\n(\${d.project_name || "Unknown Project"})\`
    ];`;

content = content.substring(0, secPathStart) + newSecPath + content.substring(secPathEnd);

fs.writeFileSync("src/lib/excelExport.ts", content);
console.log("Hierarchy updated.");

