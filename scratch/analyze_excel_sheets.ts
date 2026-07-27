import xlsx from "xlsx";

const filePath = "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx";
const wb = xlsx.readFile(filePath);

console.log("=== SHEET NAMES ===");
console.log(wb.SheetNames);
console.log("");

for (const name of wb.SheetNames) {
  console.log(`\n========== SHEET: "${name}" ==========`);
  const sheet = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  if (rows.length === 0) {
    console.log("  (empty sheet)");
    continue;
  }
  
  console.log(`  Total rows: ${rows.length}`);
  console.log(`  Headers (row 0): ${JSON.stringify(rows[0])}`);
  
  // Show first 5 data rows
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    console.log(`  Row ${i}: ${JSON.stringify(rows[i])}`);
  }
}
