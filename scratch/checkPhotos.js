const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.activity_photos.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });
  console.log(p);
}
main().finally(() => prisma.$disconnect());
