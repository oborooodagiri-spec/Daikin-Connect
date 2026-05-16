const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findProject() {
  const project = await prisma.projects.findFirst({
    where: {
      name: { contains: 'Heartology' }
    }
  });
  console.log(JSON.stringify(project, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value, 2));
  await prisma.$disconnect();
}

findProject().catch(console.error);
