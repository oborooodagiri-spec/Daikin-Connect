const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function check() {
  try {
    const total = await prisma.service_activities.count();
    const notDeleted = await prisma.service_activities.count({ where: { deleted_at: null } });
    const isDeleted = await prisma.service_activities.count({ where: { NOT: { deleted_at: null } } });
    
    console.log('Total reports:', total);
    console.log('Not deleted (NULL):', notDeleted);
    console.log('Deleted (NOT NULL):', isDeleted);
    
    const first = await prisma.service_activities.findFirst();
    console.log('First report example:', first);
    
    const units = await prisma.units.findMany({ take: 5 });
    console.log('Units example:', units.map(u => ({ id: u.id, project_ref_id: u.project_ref_id })));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
