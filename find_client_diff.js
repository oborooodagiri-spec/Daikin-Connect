const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findClientDiff() {
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  const excelClients = {};
  
  rows.forEach(r => {
    const sector = String(getVal(r, 'sector')).trim();
    const status = String(getVal(r, 'status')).trim().toUpperCase();
    const client = String(getVal(r, 'klien name') || getVal(r, 'client') || getVal(r, 'project')).trim();
    let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
    
    if (typeof quotation === 'string') {
      quotation = quotation.replace(/[^0-9.-]+/g, "");
    }
    const val = Number(quotation || 0);

    if (['Industri', 'Heavy Industri'].includes(sector)) {
      if (['A', 'B', 'C', 'D', 'E'].includes(status)) {
        excelClients[client] = (excelClients[client] || 0) + val;
      }
    }
  });

  const dbDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] },
      status: { in: ['A', 'B', 'C', 'D', 'E'] }
    }
  });

  const dbClients = {};
  dbDeals.forEach(d => {
    const client = d.client_name.trim();
    const val = Number(d.quotation);
    dbClients[client] = (dbClients[client] || 0) + val;
  });

  console.log("Clients in Excel but different or missing in DB:");
  for (const client in excelClients) {
    const exVal = excelClients[client];
    const dbVal = dbClients[client] || 0;
    if (Math.abs(exVal - dbVal) > 10) { // allow small rounding
      console.log(`[Excel > DB] ${client}: Excel=${exVal}, DB=${dbVal}, Diff=${exVal - dbVal}`);
    }
  }

  console.log("\nClients in DB but different or missing in Excel:");
  for (const client in dbClients) {
    const dbVal = dbClients[client];
    const exVal = excelClients[client] || 0;
    if (Math.abs(dbVal - exVal) > 10) { // allow small rounding
      console.log(`[DB > Excel] ${client}: DB=${dbVal}, Excel=${exVal}, Diff=${dbVal - exVal}`);
    }
  }
}

findClientDiff().catch(console.error).finally(() => prisma.$disconnect());
