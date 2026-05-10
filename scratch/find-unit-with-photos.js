const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const photo = await prisma.activity_photos.findFirst({
    where: { photo_url: { contains: '/api/assets/' } },
    include: { service_activities: { include: { units: true } } }
  });
  console.log(JSON.stringify(photo, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
