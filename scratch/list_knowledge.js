const { PrismaClient } = require("../src/generated/client_v3");
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.knowledge_resources.findMany();
  console.log(JSON.stringify(resources, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
