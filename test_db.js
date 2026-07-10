const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const units = await prisma.units.findMany({ where: { project_id: 1n } });
  console.log(`Total units in Plaza Indonesia: ${units.length}`);
  console.log(units.slice(0, 3));
}

run().finally(() => prisma.$disconnect());
