const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'Data Project', 'Form', 'Pricelist', 'Pricelist Juni 2026.xlsx');

try {
  const workbook = xlsx.readFile(target);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log('Sheet name:', sheetName);
  console.log('First 20 rows:');
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    console.log(data[i]);
  }
} catch (e) {
  console.error(e);
}
