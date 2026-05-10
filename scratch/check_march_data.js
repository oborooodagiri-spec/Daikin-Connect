const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function checkMarchActivities() {
  console.log("Checking activities from March 1st to March 20th...");
  
  const activities = await prisma.service_activities.findMany({
    where: {
      units: { project_ref_id: 1n },
      service_date: {
        gte: new Date('2026-03-01'),
        lte: new Date('2026-03-20')
      },
      deleted_at: null
    },
    include: {
      units: { select: { room_tenant: true, tag_number: true } },
      _count: { select: { activity_photos: true } }
    },
    orderBy: { service_date: 'asc' }
  });

  console.log(`Found ${activities.length} activities.`);
  
  activities.forEach(a => {
    console.log(`[${a.service_date.toISOString().split('T')[0]}] ${a.units?.room_tenant.padEnd(30)} | Photos: ${a._count.activity_photos} | URL: ${a.photo_url || 'NULL'}`);
  });

  await prisma.$disconnect();
}

checkMarchActivities();
