const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function finalVerification() {
  const allDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
    }
  });

  const activeDeals = allDeals.filter(d => d.status !== 'L');
  
  // Total pipeline without lost
  const totalAmount = activeDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  console.log(`Total Pipeline (excl L): Rp ${totalAmount}`);
  
  // Commercial without T and H
  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];
  const commDeals = activeDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));
  const commFiltered = commDeals.filter(d => !['T', 'H'].includes(d.status));
  const commAmount = commFiltered.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  console.log(`Total Commercial (excl T, H, L): Rp ${commAmount}`);

  // Industry without T and H
  const INDUSTRY_SECTORS = ["Industri", "Heavy Industri"];
  const indDeals = activeDeals.filter(d => INDUSTRY_SECTORS.includes(d.sector || ''));
  const indFiltered = indDeals.filter(d => !['T', 'H'].includes(d.status));
  const indAmount = indFiltered.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  console.log(`Total Industry (excl T, H, L): Rp ${indAmount}`);
}

finalVerification().catch(console.error).finally(() => prisma.$disconnect());
