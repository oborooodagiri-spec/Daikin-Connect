const xlsx = require('xlsx');

async function checkExact() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  let totalIndustry = 0;
  let totalCommercial = 0;

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  rows.forEach(r => {
    const sector = String(getVal(r, 'sector')).trim();
    const status = String(getVal(r, 'status')).trim().toUpperCase();
    let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
    
    if (typeof quotation === 'string') {
      quotation = quotation.replace(/[^0-9.-]+/g, "");
    }
    const val = Number(quotation || 0);

    // According to user, Industry is 176,396,739,994
    if (['Industri', 'Heavy Industri'].includes(sector)) {
      if (['A', 'B', 'C', 'D', 'E'].includes(status)) {
        totalIndustry += val;
      }
    }
    if (['Komersial', 'Government', 'Hospital'].includes(sector)) {
      if (['A', 'B', 'C', 'D', 'E'].includes(status)) {
        totalCommercial += val;
      }
    }
  });

  console.log(`Excel Script Industry (A-E): ${totalIndustry}`);
  console.log(`Excel Script Commercial (A-E): ${totalCommercial}`);
}

checkExact().catch(console.error);
