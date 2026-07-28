const { PrismaClient } = require('./src/generated/client_v3');
const xlsx = require('xlsx');
const prisma = new PrismaClient();

async function fixDB() {
  // Update PT. Sumco Indonesia
  await prisma.pipeline_deals.updateMany({
    where: { client_name: 'PT. Sumco Indonesia', quotation: BigInt(2250000000) },
    data: { quotation: BigInt(2565000000) }
  });
  console.log("Updated PT. Sumco Indonesia");

  // Read Excel for the exact missing deals
  const workbook = xlsx.readFile('C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const getVal = (r, keyWord) => {
    const key = Object.keys(r).find(k => k.toLowerCase().includes(keyWord));
    return key ? r[key] : null;
  };

  const toInsert = [];

  rows.forEach(r => {
    const client = String(getVal(r, 'klien name') || getVal(r, 'client') || getVal(r, 'project')).trim();
    if (client === 'TPPI' || client.includes('RC-FCU Trias')) {
      const sector = String(getVal(r, 'sector')).trim();
      const status = String(getVal(r, 'status')).trim().toUpperCase();
      let quotation = getVal(r, 'total rp') || getVal(r, 'quotation');
      if (typeof quotation === 'string') {
        quotation = quotation.replace(/[^0-9.-]+/g, "");
      }
      const val = BigInt(Math.floor(Number(quotation || 0)));
      
      toInsert.push({
        client_name: client,
        project_name: String(getVal(r, 'project & bill material')).trim(),
        type: String(getVal(r, 'tipe')).trim(),
        pic: String(getVal(r, 'pic')).trim(),
        category: String(getVal(r, 'category')).trim(),
        sector: sector,
        status: status,
        quotation: val,
        source: 'EPL',
        region: String(getVal(r, 'area2') || 'Unknown'),
        target_po_date: new Date()
      });
    }
  });

  for (const data of toInsert) {
    const existing = await prisma.pipeline_deals.findFirst({
      where: { client_name: data.client_name, quotation: data.quotation }
    });
    if (!existing) {
      await prisma.pipeline_deals.create({ data });
      console.log(`Inserted ${data.client_name}`);
    }
  }
}

fixDB().catch(console.error).finally(() => prisma.$disconnect());
