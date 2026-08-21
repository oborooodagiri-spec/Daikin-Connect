const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const deals = await prisma.pipeline_deals.findMany({
    select: { pic: true, sales_planner: true }
  });
  console.log(JSON.stringify(deals, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
