const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function run() {
  try {
    const projects = await prisma.projects.findMany({ where: { name: { contains: 'plaza indonesia' } } });
    const project = projects[0];

    const existingActivities = await prisma.service_activities.findMany({
      where: {
        units: { project_ref_id: project.id },
        type: 'Preventive',
        deleted_at: null,
        service_date: { gte: new Date('2026-05-01'), lt: new Date('2026-06-01') }
      },
      orderBy: { id: 'asc' }
    });

    console.log("Total activities found in May:", existingActivities.length);
    
    // We expect around 751 activities. The 436 new ones were created today (2026-06-19)
    // We will delete the ones created before 2026-06-18
    const toDeleteIds = existingActivities
      .filter(act => new Date(act.created_at) < new Date('2026-06-18'))
      .map(act => act.id);

    console.log("Found", toDeleteIds.length, "old activities to delete.");

    if (toDeleteIds.length > 0) {
      const result = await prisma.service_activities.updateMany({
        where: { id: { in: toDeleteIds } },
        data: { deleted_at: new Date() }
      });
      console.log(`Successfully soft-deleted ${result.count} old reports.`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
