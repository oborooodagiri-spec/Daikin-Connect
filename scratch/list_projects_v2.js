const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  try {
    const projects = await prisma.projects.findMany({
      select: { id: true, name: true }
    });
    console.log(JSON.stringify(projects, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
