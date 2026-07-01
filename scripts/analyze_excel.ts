import xlsx from "xlsx";
import path from "path";
import fs from "fs";

const filePath = path.join(process.cwd(), "Data Project/Form/Pricelist/Pricelist Juni 2026.xlsx");
const wb = xlsx.readFile(filePath);

const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

const results: any[] = [];

for (let r = 0; r < data.length; r++) {
  const row = data[r];
  if (!row) continue;
  
  for (let c = 0; c < row.length; c++) {
    const cell = row[c];
    if (typeof cell === "string" && cell.length > 2) {
      // Look ahead up to 4 columns for a price
      let price = null;
      for (let i = 1; i <= 4; i++) {
        if (c + i < row.length) {
          const nextCell = row[c + i];
          if (typeof nextCell === "number" && nextCell > 1000) {
            price = nextCell;
            break;
          }
        }
      }
      
      if (price) {
        results.push({
          row: r,
          col: c,
          desc: cell,
          price: price,
          context: row.slice(Math.max(0, c-2), c+5).join(" | ")
        });
      }
    }
  }
}

fs.writeFileSync("excel_dump.json", JSON.stringify(results, null, 2));
console.log(`Found ${results.length} potential items`);
