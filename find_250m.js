const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find250M() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(250000000),
      sector: { in: ['Industri', 'Heavy Industri'] }
    }
  });

  console.log("Deals with exactly 250M:");
  console.dir(deals, { depth: null });
}

find250M().catch(console.error).finally(() => prisma.$disconnect());
