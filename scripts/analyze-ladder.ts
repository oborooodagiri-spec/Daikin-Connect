import xlsx from "xlsx";
import path from "path";

const filePath = path.join(process.cwd(), "Data Project/Form/boq/Cable ladder, tray, underfloor duct (brand three start)/CABLE LADDER , CABLE TRAY , UNDERFLOOR DUCT MERK (THREE START).xlsx");
const wb = xlsx.readFile(filePath);

wb.SheetNames.forEach(sheetName => {
  console.log(`\n\n--- SHEET: ${sheetName} ---`);
  const sheet = wb.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  for (let r = 0; r < Math.min(50, data.length); r++) {
    console.log(`Row ${r}:`, JSON.stringify(data[r]));
  }
});
