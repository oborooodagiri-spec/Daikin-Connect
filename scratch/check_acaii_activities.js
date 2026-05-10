const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
async function check() {
  const acts = await prisma.service_activities.findMany({ 
    where: { unit_id: 17945 },
    include: { activity_photos: true }
  });
  console.log(JSON.stringify(acts, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  await prisma.$disconnect();
}
check();
