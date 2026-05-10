const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function investigate() {
  console.log("Investigating HOUSE OF ULTIMA 002...");
  const unit = await prisma.units.findFirst({
    where: { room_tenant: { contains: "HOUSE OF ULTIMA" } }
  });
  console.log("Found Unit:", unit);

  if (unit) {
    const activities = await prisma.service_activities.findMany({
      where: { unit_id: unit.id },
      include: { _count: { select: { activity_photos: true } } }
    });
    console.log("Activities for this unit:");
    activities.forEach(a => console.log(`- ID: ${a.id}, Date: ${a.service_date}, Photos: ${a._count.activity_photos}, URL: ${a.photo_url}`));
  }
  
  await prisma.$disconnect();
}
investigate().catch(console.error);
