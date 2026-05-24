const { PrismaClient } = require("../src/generated/client_v3");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { id: 10 }
  });
  console.log("USER 10 PROFILE:");
  console.log(JSON.stringify(user, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value, 2
  ));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
