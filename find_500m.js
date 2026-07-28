const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find500M() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(500000000),
      is_closed: false,
      status: { in: ['A', 'B', 'C', 'D', 'E'] },
      sector: { in: ['Industri', 'Heavy Industri'] }
    }
  });

  console.log("Deals with exactly 500M:");
  console.dir(deals, { depth: null });
}

find500M().catch(console.error).finally(() => prisma.$disconnect());
