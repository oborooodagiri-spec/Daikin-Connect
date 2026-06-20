const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function restoreReports() {
  try {
    const projects = await prisma.projects.findMany({
      where: { name: { contains: 'plaza indonesia' } }
    });
    if (projects.length === 0) return;
    const projectId = projects[0].id;
    const units = await prisma.units.findMany({
      where: { project_ref_id: projectId }
    });
    const unitIds = units.map(u => u.id);

    const result = await prisma.service_activities.updateMany({
      where: {
        unit_id: { in: unitIds },
        type: 'Preventive',
        deleted_at: { not: null }
      },
      data: {
        deleted_at: null
      }
    });
    console.log(`Successfully restored ${result.count} reports.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
restoreReports();
