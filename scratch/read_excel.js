const xlsx = require('xlsx');
const EXCEL_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\preventive maintenance FCU.xlsx';

function read() {
  try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Print header and first 5 data rows (starting from row 10 as per sync script)
    console.log("Spreadsheet Header (Row 1-2):");
    console.log(JSON.stringify(rawData.slice(0, 2), null, 2));
    
    console.log("\nSpreadsheet Data (Row 10-15):");
    console.log(JSON.stringify(rawData.slice(9, 15), null, 2));
  } catch (err) {
    console.error("Error reading excel:", err.message);
  }
}

read();
