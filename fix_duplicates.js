
const fs = require("fs");
const content = fs.readFileSync("src/lib/excelExport.ts", "utf8");

const parts = content.split("export const exportCategoryMatrix");
// parts[0] is everything before the first exportCategoryMatrix
// parts[1] is the old exportCategoryMatrix (up to the next function exportSectorMatrix)
// parts[2] is the newly added exportCategoryMatrix

const beforeFirst = parts[0];

const sectorStart = parts[1].indexOf("export const exportSectorMatrix");
const sectorAndBeyond = parts[1].substring(sectorStart);

const newFunction = "export const exportCategoryMatrix" + parts[2];

const newContent = beforeFirst + newFunction + "\n\n" + sectorAndBeyond;
fs.writeFileSync("src/lib/excelExport.ts", newContent);

