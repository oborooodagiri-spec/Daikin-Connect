const xlsx = require('xlsx');

async function find500MInExcel() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  rows.forEach((r, idx) => {
    let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
    if (typeof quotation === 'string') {
      quotation = quotation.replace(/[^0-9.-]+/g, "");
    }
    const val = Number(quotation || 0);

    if (val === 500000000) {
      console.log(`Found 500M in Excel Row ${idx}:`, r);
    }
  });
}

find500MInExcel().catch(console.error);
