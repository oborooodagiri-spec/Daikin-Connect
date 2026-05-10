const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const audits = await prisma.service_activities.findMany({
    where: { type: 'Audit' },
    select: {
      service_date: true,
      unit_id: true,
      units: {
        select: {
          room_tenant: true,
          tag_number: true
        }
      }
    },
    orderBy: { service_date: 'asc' }
  });
  
  console.log('Existing Audit Reports:');
  audits.forEach(a => {
    console.log(`${a.service_date?.toISOString().split('T')[0]} | ID: ${a.unit_id} | ${a.units?.room_tenant} (${a.units?.tag_number})`);
  });
  
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
