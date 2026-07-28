const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findRecentIndustry() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] }
    }
  });

  const recent = deals.filter(d => {
    return d.created_at.toISOString().startsWith('2026-07-27');
  });

  let sum = 0n;
  recent.forEach(d => {
    console.log(`[${d.status}] ${d.client_name} - ${d.quotation}`);
    sum += BigInt(d.quotation || 0);
  });

  console.log("Total recent (July 27):", sum.toString());
}

findRecentIndustry().catch(console.error).finally(() => prisma.$disconnect());
