import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const photos = await prisma.activity_photos.findMany({
    take: 10,
    orderBy: { id: 'desc' }
  });
  console.log("Recent activity_photos:");
  console.log(JSON.stringify(photos, null, 2));

  const servicePhotos = await prisma.service_photos.findMany({
    take: 10,
    orderBy: { id: 'desc' }
  });
  console.log("\nRecent service_photos:");
  console.log(JSON.stringify(servicePhotos, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
