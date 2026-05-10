const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const activities = await prisma.activities.findMany({
    where: { 
      type: 'Preventive',
      units: { unit_type: { contains: 'Chiller' } }
    },
    include: { units: true },
    orderBy: { created_at: 'desc' },
    take: 10
  });
  console.log('Recent Chiller Quick Activities:');
  activities.forEach(a => {
    console.log(`- ID: ${a.id}, Unit: ${a.units?.tag_number}, UnitType: ${a.units?.unit_type}, ProjectID: ${a.units?.project_ref_id}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
