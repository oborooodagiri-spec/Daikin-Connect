const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.projects.findMany({
    select: { id: true, name: true }
  });
  console.log(JSON.stringify(projects, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
