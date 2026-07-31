const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const areas = await prisma.deal.findMany({
    select: { area: true, region: true },
    distinct: ['area']
  });
  console.log(areas);
}
main().finally(() => prisma.$disconnect());
