const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkSectors() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const totals = {};
  const counts = {};
  
  deals.forEach(d => {
    let sector = d.sector ? d.sector.trim().toUpperCase() : 'UNKNOWN';
    totals[sector] = (totals[sector] || 0) + (Number(d.quotation) || 0);
    counts[sector] = (counts[sector] || 0) + 1;
  });
  
  for (const s in totals) {
    console.log(`Sector [${s}]: ${counts[s]} projects, Rp ${totals[s].toLocaleString('id-ID')}`);
  }
}

checkSectors().catch(console.error).finally(() => prisma.$disconnect());
