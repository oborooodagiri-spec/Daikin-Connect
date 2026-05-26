const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const activities = await prisma.service_activities.findMany({
    where: {
      units: {
        tag_number: 'DKN002077'
      }
    },
    include: {
      activity_photos: true
    }
  });
  console.log(JSON.stringify(activities, null, 2));
}
main().finally(() => prisma.$disconnect());
