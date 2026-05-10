const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function checkPhotos() {
  console.log("Checking Photo Status for Plaza Indonesia (Project 1)...");
  
  const totalUnits = await prisma.units.count({
    where: { project_ref_id: 1n }
  });
  
  const activities = await prisma.service_activities.findMany({
    where: { units: { project_ref_id: 1n }, deleted_at: null },
    include: { 
      _count: { select: { activity_photos: true } },
      units: { select: { room_tenant: true, tag_number: true } }
    }
  });

  console.log(`Total Units: ${totalUnits}`);
  console.log(`Total Activities: ${activities.length}`);
  
  const withPhotos = activities.filter(a => a._count.activity_photos > 0);
  const withoutPhotos = activities.filter(a => a._count.activity_photos === 0);
  
  console.log(`Activities WITH Photos: ${withPhotos.length}`);
  console.log(`Activities WITHOUT Photos: ${withoutPhotos.length}`);
  
  if (withoutPhotos.length > 0) {
    console.log("\nSample Activities WITHOUT Photos (First 10):");
    withoutPhotos.slice(0, 10).forEach(a => {
      console.log(`- [${a.service_date?.toISOString()?.split('T')[0]}] ${a.units?.room_tenant} (${a.type})`);
    });
  }

  await prisma.$disconnect();
}

checkPhotos();
