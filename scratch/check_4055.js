const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
async function check() {
  const unit = await prisma.units.findUnique({ where: { id: 4055 } });
  console.log(unit.room_tenant, unit.unit_type);
  await prisma.$disconnect();
}
check();
