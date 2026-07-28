const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findEPL() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      OR: [
        { client_name: { contains: 'EPL' } },
        { project_name: { contains: 'EPL' } }
      ],
      sector: { in: ['Industri', 'Heavy Industri'] }
    }
  });

  console.log("Deals with EPL in name:");
  deals.forEach(d => {
    console.log(`[${d.status}] ${d.client_name} - ${d.quotation}`);
  });
}

findEPL().catch(console.error).finally(() => prisma.$disconnect());
