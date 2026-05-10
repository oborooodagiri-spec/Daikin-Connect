const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const photos = await prisma.activity_photos.findMany({
    take: 10,
    orderBy: { id: 'desc' }
  });
  console.log(JSON.stringify(photos, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
