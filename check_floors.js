const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkFloorDistribution() {
  const PROJECT_ID = 5n;
  
  const stats = await prisma.units.groupBy({
    by: ['building_floor'],
    where: { project_ref_id: PROJECT_ID },
    _count: true
  });

  console.log("--- Units per Floor ---");
  stats.forEach(s => {
    console.log(`${s.building_floor || 'Unknown'}: ${s._count} units`);
  });

  const total = await prisma.units.count({ where: { project_ref_id: PROJECT_ID } });
  console.log(`\nTotal Units in DB for Project 5: ${total}`);

  await prisma.$disconnect();
}

checkFloorDistribution().catch(console.error);
