const xlsx = require('xlsx');

async function checkRSPremier() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  rows.forEach(r => {
    const client = JSON.stringify(r).toLowerCase();
    if (client.includes('rs premier')) {
      console.log(r);
    }
  });
}

checkRSPremier().catch(console.error);
