const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkPipeline() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const total = deals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  
  console.log(`Total Pipeline Projects: ${deals.length}`);
  console.log(`Total Pipeline Amount: Rp ${total.toLocaleString('id-ID')}`);
}

checkPipeline().catch(console.error).finally(() => prisma.$disconnect());
