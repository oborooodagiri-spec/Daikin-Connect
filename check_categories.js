const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkCategories() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const totals = {};
  const counts = {};
  
  deals.forEach(d => {
    let cat = d.category ? d.category.trim().toUpperCase() : 'UNKNOWN';
    // Clean up category string just in case
    totals[cat] = (totals[cat] || 0) + (Number(d.quotation) || 0);
    counts[cat] = (counts[cat] || 0) + 1;
  });
  
  for (const cat in totals) {
    console.log(`Category [${cat}]: ${counts[cat]} projects, Rp ${totals[cat].toLocaleString('id-ID')}`);
  }
}

checkCategories().catch(console.error).finally(() => prisma.$disconnect());
