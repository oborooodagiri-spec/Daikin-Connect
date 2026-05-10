const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const activities = await prisma.service_activities.findMany({
    where: { units: { project_ref_id: 4 } },
    include: { units: true },
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log('Recent Activities in Lanud:');
  activities.forEach(a => {
    console.log(`- ID: ${a.id}, Type: ${a.type}, Unit: ${a.units?.tag_number}, UnitType: ${a.units?.unit_type}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
