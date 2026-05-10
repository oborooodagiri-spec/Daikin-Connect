const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const intel = await prisma.project_intelligence.findUnique({
    where: { project_id: BigInt(4) }
  });
  console.log(JSON.stringify(intel, (key, value) => typeof value === 'bigint' ? value.toString() : value));
  await prisma.$disconnect();
}

main();
