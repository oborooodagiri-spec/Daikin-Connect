const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\D22AGRI-EPL\\Downloads\\daily_sync.xlsx';
const workbook = XLSX.readFile(filePath);

console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\nSheet: ${name}`);
    for (let i = 0; i < Math.min(data.length, 30); i++) {
        console.log(`Row ${i}:`, data[i]);
    }
});
