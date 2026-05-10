const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

const normalize = (name) => {
  return (name || '').toUpperCase()
    .replace(/^(TENANT|AREA|UNIT|FCU|AHU|SPLIT)\s+/i, '')
    .replace(/[^A-Z0-9]/g, '')
    .replace(/LT\d+$/, '')
    .replace(/0+\d+$/, '')
    .trim();
};

async function check() {
  const units = await prisma.units.findMany({ 
    where: { project_ref_id: 1 }, 
    select: { room_tenant: true },
    distinct: ['room_tenant']
  });
  console.log('Sample Normalization:');
  units.slice(0, 50).forEach(u => {
    console.log(`${u.room_tenant} -> ${normalize(u.room_tenant)}`);
  });
  await prisma.$disconnect();
}
check();
