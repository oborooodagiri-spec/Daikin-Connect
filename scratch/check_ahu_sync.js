const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  try {
    const unit = await prisma.units.findFirst({
      where: { code: 'AHU P2-08', room_tenant: 'CORRIDOR BROWN PUCK COFFEE' },
      include: {
        service_activities: {
          where: { type: 'Preventive' },
          orderBy: { service_date: 'desc' }
        }
      }
    });

    if (!unit) {
      console.log("Unit not found!");
      return;
    }

    console.log(`Unit: ${unit.room_tenant} (${unit.code})`);
    console.log(`Tag: ${unit.tag_number}`);
    console.log(`Total Preventive Activities: ${unit.service_activities.length}`);

    unit.service_activities.forEach(act => {
      console.log(`\nDate: ${act.service_date}`);
      console.log(`Technical JSON:`, JSON.parse(act.technical_json));
    });

  } catch (err) {
    console.error(err);
  }
}

check().finally(() => prisma.$disconnect());
