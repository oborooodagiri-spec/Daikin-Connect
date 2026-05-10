const XLSX = require('xlsx');
const wb = XLSX.readFile('C:/Users/D22AGRI-EPL/Downloads/Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx');
const sheet = wb.Sheets['Report Plaza Indonesia'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});

let dupes = {};
for (let i = 5; i < data.length; i++) {
  const r = data[i];
  const code = String(r[4] || '').trim();
  const tenant = String(r[10] || '').trim();
  const kat = String(r[5] || '').toUpperCase();
  if (!code || !tenant || (kat !== 'FCU' && kat !== 'AHU')) continue;
  const key = `${tenant}|${kat}`;
  dupes[key] = (dupes[key] || 0) + 1;
}

const multiUnits = Object.entries(dupes).filter(([k, v]) => v > 1);
console.log('Tenants with multiple units:', multiUnits.length);
multiUnits.forEach(([k, v]) => console.log(`  ${k}: ${v} units`));
console.log('Total multi-unit records:', multiUnits.reduce((a, [,v]) => a + v, 0));
console.log('Total single-unit records:', Object.values(dupes).filter(v => v === 1).length);
