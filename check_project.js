const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function find() {
  try {
    const project = await prisma.projects.findFirst({
      where: { name: { contains: 'Plaza Indonesia' } }
    });
    console.log("PROJECT_FOUND:", JSON.stringify(project, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

find();
