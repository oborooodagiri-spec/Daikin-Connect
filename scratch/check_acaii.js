const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
async function check() {
  const u = await prisma.units.findFirst({ where: { room_tenant: 'ACAII' } });
  console.log(u);
  const acts = await prisma.service_activities.findMany({ where: { unit_id: u.id } });
  console.log('Activities for ACAII:', acts);
  await prisma.$disconnect();
}
check();
