const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function generatePhotoReport() {
  console.log("Generating Photo URL Report for Plaza Indonesia...");
  
  const activities = await prisma.service_activities.findMany({
    where: {
      units: { project_ref_id: 1n },
      deleted_at: null
    },
    include: {
      units: { select: { room_tenant: true, tag_number: true, unit_type: true } },
      activity_photos: true
    },
    orderBy: { service_date: 'asc' }
  });

  console.log("No.,Tanggal,Unit,Tenant,Foto 1,Foto 2,Foto 3");
  
  activities.forEach((a, i) => {
    const date = a.service_date ? a.service_date.toISOString().split('T')[0] : "-";
    const tenant = a.units?.room_tenant || "-";
    const unit = a.units?.tag_number || "-";
    
    const photos = a.activity_photos.map(p => `https://daikin-connect.com${p.photo_url}`);
    const p1 = photos[0] || "";
    const p2 = photos[1] || "";
    const p3 = photos[2] || "";
    
    console.log(`${i+1},${date},${unit},${tenant},${p1},${p2},${p3}`);
  });

  await prisma.$disconnect();
}

generatePhotoReport();
