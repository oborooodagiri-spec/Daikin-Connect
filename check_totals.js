const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkTotals() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { notIn: ['L', 'H'] }
    }
  });

  const totals = {};
  deals.forEach(d => {
    const val = Number(d.quotation) || 0;
    const status = d.status || 'unknown';
    totals[status] = (totals[status] || 0) + val;
  });

  for (const s in totals) {
    console.log(`Status ${s}: Rp ${totals[s].toLocaleString('id-ID')}`);
  }
}

checkTotals().catch(console.error).finally(() => prisma.$disconnect());
