const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find500MAll() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(500000000),
      sector: { in: ['Industri', 'Heavy Industri'] }
    }
  });

  console.log("Deals with exactly 500M (any status):");
  console.dir(deals, { depth: null });
}

find500MAll().catch(console.error).finally(() => prisma.$disconnect());
