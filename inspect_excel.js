const ExcelJS = require('exceljs');

async function inspect() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\Plaza Indonesia\\2026\\Mei\\Corrective\\Corrective Mei 2026 - plaza indonesia.xlsx');
  
  console.log("Sheets:");
  wb.eachSheet((sheet, id) => {
    console.log(`- ${sheet.name} (Rows: ${sheet.rowCount})`);
    for(let i=1; i<=6; i++) {
        console.log(`  Row ${i}:`, sheet.getRow(i).values);
    }
  });
}

inspect().catch(console.error);
