import xlsx from "xlsx";
import path from "path";

const filePath = path.join(process.cwd(), "Data Project/Form/boq/kabel/kabel.xlsx");
const wb = xlsx.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

const results: any[] = [];

for (let r = 0; r < data.length; r++) {
  const row = data[r];
  if (!row) continue;
  
  for (let c = 0; c < row.length; c++) {
    const cell = row[c];
    if (typeof cell === "number" && cell > 1000) {
      
      // Find type by going UP in the same column until we hit a string
      let type = "Cable";
      for (let up = r - 1; up >= 0; up--) {
        if (data[up] && typeof data[up][c] === "string" && data[up][c].length > 1 && !data[up][c].toLowerCase().includes("margin") && !data[up][c].toLowerCase().includes("total")) {
          type = data[up][c];
          break;
        }
      }

      // Find size by going UP in column 2 until we hit a string with "mm²"
      let size = "Unknown Size";
      for (let up = r; up >= 0; up--) {
        if (data[up] && typeof data[up][2] === "string" && data[up][2].includes("mm²")) {
          size = data[up][2];
          break;
        }
      }

      // Find core by looking at the label in column 0 or just keeping it flat
      let rowLabel = data[r][0];

      results.push({
        name: `Kabel ${type} ${size} ${rowLabel ? '(' + rowLabel + ')' : ''}`.replace(/ +/g, ' ').trim(),
        price: cell
      });
    }
  }
}

console.log(results.slice(0, 30));
console.log(`Total found: ${results.length}`);
