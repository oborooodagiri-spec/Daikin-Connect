const xlsx = require('xlsx');

async function checkPivot() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  const statusSums = {};
  
  rows.forEach(r => {
    const sector = String(getVal(r, 'sector')).trim();
    const status = String(getVal(r, 'status')).trim().toUpperCase();
    let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
    
    if (typeof quotation === 'string') {
      quotation = quotation.replace(/[^0-9.-]+/g, "");
    }
    const val = Number(quotation || 0);

    if (['Industri', 'Heavy Industri'].includes(sector)) {
      statusSums[status] = (statusSums[status] || 0) + val;
    }
  });

  console.log("Industry sums by status in Excel Raw:");
  for (const s in statusSums) {
    console.log(`[${s}] : ${statusSums[s]}`);
  }
}

checkPivot().catch(console.error);
