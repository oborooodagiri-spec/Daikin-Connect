const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function fix() {
  const act = await prisma.service_activities.findUnique({
    where: { id: 1474 },
    include: { activity_photos: true }
  });

  if (act) {
    let techJson = {};
    try {
      techJson = JSON.parse(act.technical_json || '{}');
    } catch(e) {}

    // Inject findings
    techJson.finding = "U-trap tidak ada, Filter udara tidak ada";
    techJson.recommendation = "-";

    await prisma.service_activities.update({
      where: { id: 1474 },
      data: {
        technical_json: JSON.stringify(techJson),
        technical_advice: "Finding: U-trap tidak ada, Filter udara tidak ada\nRecommendation: -"
      }
    });

    console.log("Updated technical_json for 1474.");
  }

  // Find if there are photos floating around for HOUSE OF ULTIMA 002
  // Let's check activities created on May 8th just in case my sync script created a new activity!
  const recentActivities = await prisma.service_activities.findMany({
    where: {
      created_at: { gte: new Date('2026-05-08T00:00:00.000Z') },
      unit_id: 16510
    },
    include: { activity_photos: true }
  });

  console.log("Recent activities created today for this unit:", recentActivities.length);
  for (const r of recentActivities) {
    console.log(`- ID: ${r.id}, Photos: ${r.activity_photos.length}, photo_url: ${r.photo_url}`);
    
    // If it has photos, move them to 1474
    if (r.activity_photos.length > 0) {
      await prisma.activity_photos.updateMany({
        where: { activity_id: r.id },
        data: { activity_id: 1474 }
      });
      console.log(`Moved ${r.activity_photos.length} photos to 1474`);
    }
    if (r.photo_url) {
      await prisma.service_activities.update({
        where: { id: 1474 },
        data: { photo_url: r.photo_url }
      });
      console.log(`Moved photo_url to 1474`);
    }
    
    // Delete the mistakenly created duplicate
    await prisma.service_activities.delete({ where: { id: r.id } });
    console.log(`Deleted mistakenly created activity ${r.id}`);
  }

  await prisma.$disconnect();
}

fix().catch(console.error);
