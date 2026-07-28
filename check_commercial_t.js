const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkCommercialTender() {
  const allDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: 'T'
    }
  });

  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];
  const commercialDeals = allDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));

  let totalT = 0;
  commercialDeals.forEach(d => {
    totalT += (Number(d.quotation) || 0);
  });

  console.log(`Total T (Tender) in Commercial: Rp ${totalT}`);
}

checkCommercialTender().catch(console.error).finally(() => prisma.$disconnect());
