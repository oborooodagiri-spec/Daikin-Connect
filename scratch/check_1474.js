const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function check() {
  const act = await prisma.service_activities.findUnique({
    where: { id: 1474 },
    include: { activity_photos: true, units: true }
  });
  console.log(JSON.stringify(act, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

  // Let's also check if there are other activities for this unit
  if (act && act.units) {
    const others = await prisma.service_activities.findMany({
      where: { unit_id: act.units.id }
    });
    console.log("Other activities for this unit:");
    others.forEach(o => console.log(`- ID: ${o.id}, Date: ${o.service_date}`));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
