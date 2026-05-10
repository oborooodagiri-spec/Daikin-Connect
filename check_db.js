const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  try {
    const resources = await prisma.knowledge_resources.findMany();
    console.log("RESOURCES_FOUND:", JSON.stringify(resources));
  } catch (e) {
    console.error("PRISMA_ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
