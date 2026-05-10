const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.service_activities.count({
    where: {
      type: 'Preventive',
      units: {
        unit_type: { in: ['Split', 'Split Duct', 'Split Wall'] }
      },
      deleted_at: null
    }
  });
  console.log('Found', count, 'Split PM records');

  const samples = await prisma.service_activities.findMany({
    where: {
      type: 'Preventive',
      units: {
        unit_type: { in: ['Split', 'Split Duct', 'Split Wall'] }
      },
      deleted_at: null
    },
    take: 10,
    include: { units: true }
  });
  
  samples.forEach(s => {
    console.log(`ID: ${s.id} | Tenant: ${s.units.room_tenant} | Type: ${s.units.unit_type} | Date: ${s.service_date}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
