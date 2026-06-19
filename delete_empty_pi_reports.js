const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function deleteEmptyReports() {
  try {
    const projects = await prisma.projects.findMany({
      where: { name: { contains: 'plaza indonesia' } }
    });

    if (projects.length === 0) {
      console.log('Plaza Indonesia project not found.');
      return;
    }

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
    
    let emptyIds = [];
    
    for (const act of activities) {
      if (!act.technical_json) continue;
      
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
        if (!hasData) emptyIds.push(act.id);
      } catch(e) {}
    }
    
    console.log(`Found ${emptyIds.length} empty preventive reports for Plaza Indonesia.`);
    
    if (emptyIds.length > 0) {
      console.log('Proceeding to soft-delete these reports...');
      
      const result = await prisma.service_activities.updateMany({
        where: {
          id: { in: emptyIds }
        },
        data: {
          deleted_at: new Date()
        }
      });
      
      console.log(`Successfully deleted ${result.count} reports.`);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

deleteEmptyReports();
