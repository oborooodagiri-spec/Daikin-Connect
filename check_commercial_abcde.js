const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkCommercialABCDE() {
  const allDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { in: ['A', 'B', 'C', 'D', 'E'] }
    }
  });

  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];
  const commercialDeals = allDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));

  let totalABCDE = 0;
  commercialDeals.forEach(d => {
    totalABCDE += (Number(d.quotation) || 0);
  });

  console.log(`Total A, B, C, D, E in Commercial: Rp ${totalABCDE}`);
}

checkCommercialABCDE().catch(console.error).finally(() => prisma.$disconnect());
