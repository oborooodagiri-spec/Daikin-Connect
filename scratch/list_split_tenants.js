const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const samples = await prisma.service_activities.findMany({
    where: {
      type: 'Preventive',
      units: {
        unit_type: { in: ['Split', 'Split Duct', 'Split Wall'] }
      },
      deleted_at: null
    },
    include: { units: true }
  });
  
  const tenants = new Set();
  samples.forEach(s => tenants.add(s.units.room_tenant));
  
  console.log('Split PM Tenants:');
  Array.from(tenants).sort().forEach(t => console.log(`- ${t}`));

  await prisma.$disconnect();
}

check().catch(console.error);
