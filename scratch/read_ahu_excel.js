const xlsx = require('xlsx');
const EXCEL_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\data impor unit plaza indonesia AHU.xlsx';

function read() {
  try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log("Sheet Name:", workbook.SheetNames[0]);
    console.log("Spreadsheet Data (Row 10-12):");
    console.log(JSON.stringify(rawData.slice(9, 12), null, 2));
  } catch (err) {
    console.error("Error reading excel:", err.message);
  }
}

read();
