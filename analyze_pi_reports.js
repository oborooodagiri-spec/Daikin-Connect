const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function check() {
  try {
    const projects = await prisma.projects.findMany({
      where: { name: { contains: 'plaza indonesia' } }
    });

    const projectId = projects[0].id;
    const units = await prisma.units.findMany({
      where: { project_ref_id: projectId }
    });
    const unitIds = units.map(u => u.id);

    const activities = await prisma.service_activities.findMany({
      where: {
        unit_id: { in: unitIds },
        deleted_at: null,
        type: 'Preventive'
      }
    });
    
    let emptyCount = 0;
    for (const act of activities) {
      try {
        const parsed = JSON.parse(act.technical_json);
        let hasData = false;
        
        if (Array.isArray(parsed)) {
          for (const cat of parsed) {
            if (cat.checks && Array.isArray(cat.checks)) {
              for (const chk of cat.checks) {
                if (chk.value !== undefined && chk.value !== null && chk.value !== '') hasData = true;
                if (chk.condition && chk.condition !== '') hasData = true;
              }
            }
          }
        }
        if (!hasData) emptyCount++;
      } catch(e) {}
    }
    
    console.log(`Empty Preventive (strict - allowing 0): ${emptyCount}`);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
