const xlsx = require('xlsx');
const EXCEL_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\data impor unit plaza indonesia AHU.xlsx';

function read() {
  try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    console.log("Sheet Names:", workbook.SheetNames);
    
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`\n--- Sheet: ${name} ---`);
      console.log("Rows:", rawData.length);
      if (rawData.length > 10) {
        console.log("Sample Data (Row 10-12):");
        console.log(JSON.stringify(rawData.slice(9, 12), null, 2));
      } else {
        console.log("Sheet has fewer than 10 rows.");
      }
    });
  } catch (err) {
    console.error("Error reading excel:", err.message);
  }
}

read();
