const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const deals = await prisma.pipeline_deals.findMany();
  let totalAll = 0;
  let totalActive = 0;
  
  for (const d of deals) {
    const val = Number(d.quotation) || 0;
    totalAll += val;
    if (!d.is_closed && !['L', 'H'].includes(d.status)) {
      totalActive += val;
    }
  }
  
  console.log('Total All Deals (including Lost, Hold, Closed):', totalAll);
  console.log('Total Active Deals (shown on Dashboard):', totalActive);
}

check().catch(console.error).finally(() => prisma.$disconnect());
