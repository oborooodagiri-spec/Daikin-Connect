const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.roles.findMany();
  console.log(roles);
}
main().catch(console.error).finally(() => prisma.$disconnect());
