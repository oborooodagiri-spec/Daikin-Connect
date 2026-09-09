
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("repeat(level)")) {
    lines[i] = "      row.getCell(1).value = \"   \".repeat(level) + (level > 0 ? (level === 1 ? \"\\u25BE \" : \"  \") : \"\") + node.name;";
  }
}
fs.writeFileSync("src/lib/excelExport.ts", lines.join("\n"));

