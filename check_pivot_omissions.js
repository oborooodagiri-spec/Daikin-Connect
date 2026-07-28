const xlsx = require('xlsx');

async function checkPivotOmissions() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  let sum = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const sector = String(getVal(r, 'sector')).trim();
    const status = String(getVal(r, 'status')).trim().toUpperCase();
    let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
    
    if (typeof quotation === 'string') {
      quotation = quotation.replace(/[^0-9.-]+/g, "");
    }
    const val = Number(quotation || 0);

    if (['Industri', 'Heavy Industri'].includes(sector) && ['A', 'B', 'C', 'D', 'E'].includes(status)) {
      sum += val;
      if (sum === 962199999.5 || sum === 962199999 || sum === 962200000 || sum > 900000000 && sum < 1000000000) {
         console.log(`Sum from bottom reached ${sum} at row index ${i}`);
      }
    }
  }
}

checkPivotOmissions().catch(console.error);
