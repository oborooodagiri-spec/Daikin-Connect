const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const auditCount = await prisma.service_activities.count({
    where: { type: 'Audit' }
  });
  const correctiveCount = await prisma.service_activities.count({
    where: { type: 'Corrective' }
  });
  const preventiveCount = await prisma.service_activities.count({
    where: { type: 'Preventive' }
  });
  
  console.log('Audit Reports:', auditCount);
  console.log('Corrective Reports:', correctiveCount);
  console.log('Preventive Reports:', preventiveCount);
  
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
