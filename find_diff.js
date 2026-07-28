const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findDiff() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      quotation: BigInt(462200000)
    }
  });

  console.log("Deals with 462,200,000:", JSON.stringify(deals, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

findDiff().catch(console.error).finally(() => prisma.$disconnect());
