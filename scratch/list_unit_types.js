const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const types = await prisma.units.groupBy({
    by: ['unit_type'],
    _count: { id: true }
  });
  console.log('Unit Types in DB:');
  console.log(types);
}

check().catch(console.error).finally(() => prisma.$disconnect());
