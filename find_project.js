const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.projects.findMany({
    where: { name: { contains: 'Plaza Indonesia' } }
  });
  console.log("Plaza Indonesia projects:");
  console.log(projects);
}
main().finally(() => prisma.$disconnect());
