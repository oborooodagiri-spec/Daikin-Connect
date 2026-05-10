const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const complaints = await prisma.complaints.findMany({ 
    where: { units: { project_ref_id: 1 } },
    select: { id: true, customer_name: true, created_at: true },
    take: 5
  });
  console.log('Complaints:', complaints);

  const correctives = await prisma.service_activities.findMany({ 
    where: { type: 'Corrective', units: { project_ref_id: 1 } },
    select: { id: true, units: { select: { room_tenant: true } }, service_date: true },
    take: 5
  });
  console.log('Correctives:', correctives);

  await prisma.$disconnect();
}
check();
