const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findRecentIndustryDeals() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 10
  });

  console.log("10 Most recent Industry deals:");
  deals.forEach(d => {
    console.log(`ID: ${d.id}, Client: ${d.client_name}, Amount: ${d.quotation}, Created: ${d.created_at}`);
  });
}

findRecentIndustryDeals().catch(console.error).finally(() => prisma.$disconnect());
