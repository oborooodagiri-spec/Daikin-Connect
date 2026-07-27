import xlsx from "xlsx";

const filePath = "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx";
const wb = xlsx.readFile(filePath);

for (const name of ["Project By Status", "Booking Forecast", "Industry", "Commercial", "PIC"]) {
  console.log(`\n========== FULL SHEET: "${name}" ==========`);
  const sheet = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  for (let i = 0; i < rows.length; i++) {
    console.log(`  Row ${i}: ${JSON.stringify(rows[i])}`);
  }
}
