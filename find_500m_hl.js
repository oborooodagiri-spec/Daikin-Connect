const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find500MDiffsHL() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] },
      status: { in: ['H', 'L'] },
      quotation: BigInt(500000000)
    }
  });

  console.log("Deals in Industry with H or L ending with 500M:");
  console.dir(deals, { depth: null });
}

find500MDiffsHL().catch(console.error).finally(() => prisma.$disconnect());
