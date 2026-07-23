const xlsx = require('xlsx');

const filePath = 'C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\1\\2026Pipeline DASI Service.xlsx';
const wb = xlsx.readFile(filePath);
console.log("Sheets in Excel file:");
console.log(wb.SheetNames);

if (wb.Sheets["Pipeline OPS (2)"]) {
  const opsSheet = wb.Sheets["Pipeline OPS (2)"];
  const opsRows = xlsx.utils.sheet_to_json(opsSheet, { header: 1 });
  console.log("\\nData sample from 'Pipeline OPS (2)':");
  for (let i = 0; i < Math.min(10, opsRows.length); i++) {
    console.log(`Row ${i}:`, opsRows[i].slice(0, 5));
  }
} else {
  console.log("\\nSheet 'Pipeline OPS (2)' not found!");
}
