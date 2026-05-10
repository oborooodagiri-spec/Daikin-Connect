const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
async function check() {
  const units = await prisma.units.findMany({ where: { room_tenant: { contains: 'ACAII' } } });
  console.log(JSON.stringify(units, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  await prisma.$disconnect();
}
check();
