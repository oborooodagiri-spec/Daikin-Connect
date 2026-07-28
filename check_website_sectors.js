const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkWebsiteSectors() {
  const activeDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const INDUSTRY_SECTORS = ["Industri", "Heavy Industri"];
  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];

  const industryDeals = activeDeals.filter(d => INDUSTRY_SECTORS.includes(d.sector || ''));
  const commercialDeals = activeDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));

  const indTotal = industryDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  const comTotal = commercialDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);

  console.log(`Website Industry: ${industryDeals.length} projects, Rp ${indTotal.toLocaleString('id-ID')}`);
  console.log(`Website Commercial: ${commercialDeals.length} projects, Rp ${comTotal.toLocaleString('id-ID')}`);
  
  // Case insensitive check
  const industryDealsCI = activeDeals.filter(d => INDUSTRY_SECTORS.map(s=>s.toUpperCase()).includes((d.sector || '').toUpperCase()));
  const commercialDealsCI = activeDeals.filter(d => COMMERCIAL_SECTORS.map(s=>s.toUpperCase()).includes((d.sector || '').toUpperCase()));
  
  const indTotalCI = industryDealsCI.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  const comTotalCI = commercialDealsCI.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);

  console.log(`True Industry: ${industryDealsCI.length} projects, Rp ${indTotalCI.toLocaleString('id-ID')}`);
  console.log(`True Commercial: ${commercialDealsCI.length} projects, Rp ${comTotalCI.toLocaleString('id-ID')}`);

}

checkWebsiteSectors().catch(console.error).finally(() => prisma.$disconnect());
