
const fs = require("fs");
let content = fs.readFileSync("src/lib/excelExport.ts", "utf8");
content = content.replace(/row\.getCell\(1\)\.value = \x27   \x27\.repeat\(level\) \+ \(level > 0 \? \(level === 1 \? \x27\?\?\? \x27 \: \x27  \x27\) \: \x27\x27\) \+ node\.name;/g, "row.getCell(1).value = \"   \".repeat(level) + (level > 0 ? (level === 1 ? \"\\u25BE \" : \"  \") : \"\") + node.name;");
content = content.replace(/row\.getCell\(1\)\.value = \"   \"\.repeat\(level\) \+ \(level > 0 \? \(level === 1 \? \"\? \" \: \"  \"\) \: \"\"\) \+ node\.name;/g, "row.getCell(1).value = \"   \".repeat(level) + (level > 0 ? (level === 1 ? \"\\u25BE \" : \"  \") : \"\") + node.name;");
fs.writeFileSync("src/lib/excelExport.ts", content);

