const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    select: { id: true, name: true }
  });
  console.log(JSON.stringify(users));
  await prisma.$disconnect();
}

main();
