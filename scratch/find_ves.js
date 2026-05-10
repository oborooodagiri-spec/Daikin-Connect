const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.projects.findMany({
    where: { name: { contains: 'VES' } }
  });
  console.log(JSON.stringify(projects, (key, value) => typeof value === 'bigint' ? value.toString() : value));
  await prisma.$disconnect();
}

main();
