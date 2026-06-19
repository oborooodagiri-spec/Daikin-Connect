const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findProject() {
  try {
    const projects = await prisma.projects.findMany({
      where: { name: { contains: 'plaza indonesia' } }
    });
    console.log('Projects found:', projects);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
findProject();
