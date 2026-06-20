const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function run() {
  try {
    const projects = await prisma.projects.findMany({ where: { name: { contains: 'plaza indonesia' } } });
    const project = projects[0];

    const acts = await prisma.service_activities.findMany({
      where: {
        units: { project_ref_id: project.id },
        type: 'Preventive',
        deleted_at: null,
        service_date: { gte: new Date('2026-05-01'), lt: new Date('2026-06-01') }
      },
      orderBy: { id: 'asc' }
    });

    console.log('Total May remaining:', acts.length);

    if (acts.length === 495) {
      const toDelete = acts.slice(0, 59).map(a => a.id);
      if (toDelete.length > 0) {
        await prisma.service_activities.updateMany({
          where: { id: { in: toDelete } },
          data: { deleted_at: new Date() }
        });
        console.log('Deleted 59 old ones!');
      }
    } else {
      console.log("Not exactly 495, aborting...");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
