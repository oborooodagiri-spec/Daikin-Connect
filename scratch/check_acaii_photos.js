const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const photos = await prisma.activity_photos.findMany({
    where: {
      service_activities: {
        units: { room_tenant: { contains: 'ACAII' } }
      }
    },
    include: { service_activities: { include: { units: true } } }
  });
  
  console.log(`Found ${photos.length} photos for ACAII`);
  photos.forEach(p => {
    console.log(`Photo: ${p.photo_url} | Caption: ${p.caption} | Unit: ${p.service_activities.units.room_tenant}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
