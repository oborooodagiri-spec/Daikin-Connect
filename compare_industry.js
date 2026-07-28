const fs = require('fs');
const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function compare() {
  // Load Excel
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheetName = workbook.SheetNames[0]; // Assuming first sheet
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const excelIndustryDeals = [];
  let excelTotal = 0n;

  // Process Excel rows
  rows.forEach(r => {
    // Normalize keys
    const entries = Object.entries(r).map(([k, v]) => [k.toLowerCase().trim(), v]);
    const rowData = Object.fromEntries(entries);
    
    // Find sector, status, quotation, client
    const sectorKey = Object.keys(rowData).find(k => k.includes('sector'));
    const statusKey = Object.keys(rowData).find(k => k.includes('status'));
    const quotationKey = Object.keys(rowData).find(k => k.includes('quotation') || k.includes('amount') || k.includes('total rp'));
    const clientKey = Object.keys(rowData).find(k => k.includes('client') || k.includes('project name'));

    if (sectorKey && statusKey && quotationKey) {
      const sector = String(rowData[sectorKey]).trim();
      const status = String(rowData[statusKey]).trim().toUpperCase();
      let quotation = rowData[quotationKey];

      if (['Industri', 'Heavy Industri'].includes(sector)) {
        if (!['L', 'LOST', 'H', 'HOLD', 'T', 'TENDER', 'N'].includes(status)) {
          if (typeof quotation === 'string') {
            quotation = quotation.replace(/[^0-9.-]+/g,"");
          }
          const val = BigInt(Math.floor(Number(quotation || 0)));
          excelTotal += val;
          excelIndustryDeals.push({
            client: String(rowData[clientKey] || '').trim(),
            amount: val,
            status: status
          });
        }
      }
    }
  });

  console.log(`Excel Industry Total: ${excelTotal.toString()}`);

  // Load DB
  const dbDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] },
      status: { in: ['A', 'B', 'C', 'D', 'E'] }
    }
  });

  let dbTotal = 0n;
  const dbIndustryDeals = dbDeals.map(d => {
    dbTotal += BigInt(d.quotation);
    return {
      client: d.client_name.trim(),
      amount: BigInt(d.quotation),
      status: d.status
    };
  });

  console.log(`DB Industry Total: ${dbTotal.toString()}`);

  // Find mismatches
  // We'll map by client name + amount roughly, but let's just print deals in DB not in Excel
  const unmatchedInDB = [];
  const matchedInExcel = new Set();

  for (const dbDeal of dbIndustryDeals) {
    // Find a matching deal in excel (same amount)
    const matchIndex = excelIndustryDeals.findIndex((ex, idx) => !matchedInExcel.has(idx) && ex.amount === dbDeal.amount);
    
    if (matchIndex !== -1) {
      matchedInExcel.add(matchIndex);
    } else {
      unmatchedInDB.push(dbDeal);
    }
  }

  const unmatchedInExcel = excelIndustryDeals.filter((_, idx) => !matchedInExcel.has(idx));

  console.log("\nDeals in DB but NOT matching an amount in Excel:");
  unmatchedInDB.forEach(d => console.log(`[${d.status}] ${d.client} - ${d.amount}`));

  console.log("\nDeals in Excel but NOT matching an amount in DB:");
  unmatchedInExcel.forEach(d => console.log(`[${d.status}] ${d.client} - ${d.amount}`));

}

compare().catch(console.error).finally(() => prisma.$disconnect());
