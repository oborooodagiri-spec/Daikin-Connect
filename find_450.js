const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find450() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(450000000),
      is_closed: false,
      status: { in: ['A', 'B', 'C', 'D', 'E'] }
    }
  });

  console.log(deals);
}

find450().catch(console.error).finally(() => prisma.$disconnect());
