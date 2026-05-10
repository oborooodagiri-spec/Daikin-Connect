const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const latestUnit = await prisma.units.findFirst({
    where: { project_ref_id: 4 },
    orderBy: { tag_number: 'desc' }
  });
  console.log('Latest Unit Tag:', latestUnit ? latestUnit.tag_number : 'None');
}

check().catch(console.error).finally(() => prisma.$disconnect());
