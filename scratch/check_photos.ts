import { PrismaClient } from "./src/generated/client_v3";

const prisma = new PrismaClient();

async function main() {
  const photos = await prisma.activity_photos.findMany({
    take: 10,
    orderBy: { id: 'desc' }
  });
  console.log(JSON.stringify(photos, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
