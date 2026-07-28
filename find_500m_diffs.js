const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function find500MDiffs() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      sector: { in: ['Industri', 'Heavy Industri'] },
      status: { in: ['A', 'B', 'C', 'D', 'E'] }
    }
  });

  console.log("Deals in Industry ending with 500M:");
  deals.forEach(d => {
    const q = BigInt(d.quotation);
    if (q % 1000000000n === 500000000n) {
      console.log(`[${d.status}] ${d.client_name} - ${q}`);
    }
  });
}

find500MDiffs().catch(console.error).finally(() => prisma.$disconnect());
