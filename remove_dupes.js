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
      }
    });

    const hash = {};
    let dupes = 0;
    
    // We group by technical_json
    acts.forEach(a => {
      if (!a.technical_json) return;
      if (hash[a.technical_json]) {
        hash[a.technical_json].push(a.id);
        dupes++;
      } else {
        hash[a.technical_json] = [a.id];
      }
    });

    console.log('Total May remaining:', acts.length);
    console.log('Total Duplicates:', dupes);

    let toDelete = [];
    Object.values(hash).forEach(ids => {
      if (ids.length > 1) {
        // keep the first one, delete the rest
        toDelete.push(...ids.slice(1));
      }
    });

    console.log('IDs to delete:', toDelete.length);
    if (toDelete.length > 0) {
      await prisma.service_activities.updateMany({
        where: { id: { in: toDelete } },
        data: { deleted_at: new Date() }
      });
      console.log('Deleted duplicates!');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
