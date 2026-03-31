
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const activities = await prisma.service_activities.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { activity_photos: true }
  });

  activities.forEach(a => {
    console.log(`ID: ${a.id}, Type: ${a.type}`);
    console.log(`Technical JSON: ${a.technical_json}`);
    console.log(`Photos Count: ${a.activity_photos.length}`);
    console.log('---');
  });

  await prisma.$disconnect();
}

checkData();
