const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findMissing() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      OR: [
        { is_closed: true },
        { status: 'L' }
      ]
    }
  });

  const missing = deals.filter(d => {
    let targetTime = d.target_po_date ? new Date(d.target_po_date).getTime() : null;
    let m, y;
    if (targetTime) {
      m = new Date(d.target_po_date).getMonth() + 1;
      y = new Date(d.target_po_date).getFullYear();
    } else {
      m = new Date(d.updated_at).getMonth() + 1;
      y = new Date(d.updated_at).getFullYear();
    }
    const targetFy = m <= 3 ? (y - 1) % 100 : y % 100;
    
    // We are looking for the one that is NOT FY26
    return targetFy !== 26;
  });

  console.log(JSON.stringify(missing, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

findMissing().catch(console.error).finally(() => prisma.$disconnect());
