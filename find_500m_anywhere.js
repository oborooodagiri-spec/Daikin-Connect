const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find500MAllSectors() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(500000000),
    }
  });

  console.log("Deals with exactly 500M anywhere:");
  console.dir(deals, { depth: null });
}

find500MAllSectors().catch(console.error).finally(() => prisma.$disconnect());
