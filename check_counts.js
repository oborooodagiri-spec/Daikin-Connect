const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkProjects() {
  const totalDeals = await prisma.pipeline_deals.count();
  console.log("Total Deals in DB:", totalDeals);

  const active = await prisma.pipeline_deals.count({
    where: { is_closed: false, status: { not: 'L' } }
  });
  console.log("Active Deals (is_closed: false, status != 'L'):", active);

  const closedFy26 = await prisma.pipeline_deals.count({
    where: {
      OR: [{ is_closed: true }, { status: 'L' }],
      // Need to filter for FY26 approximately or just get all closed
    }
  });
  console.log("All Closed/Lost Deals:", closedFy26);

  const zeroValue = await prisma.pipeline_deals.count({
    where: {
      quotation: BigInt(0)
    }
  });
  console.log("Deals with 0 quotation:", zeroValue);
  
  const nullValue = await prisma.pipeline_deals.count({
    where: {
      quotation: null
    }
  });
  console.log("Deals with NULL quotation:", nullValue);
}

checkProjects().catch(console.error).finally(() => prisma.$disconnect());
