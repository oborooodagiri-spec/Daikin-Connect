
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("picTotal]") && lines[i].includes("worksheet.addRow")) {
    lines[i] = "      const pRow = worksheet.addRow([`  \\u21B3 ${pic}`, \"\", \"\", picTotal]);";
  }
}
fs.writeFileSync("src/lib/excelExport.ts", lines.join("\n"));

