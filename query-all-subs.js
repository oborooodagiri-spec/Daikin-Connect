
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const allSubs = await prisma.wa_subscribers.findMany({});
  console.log("All subs in DB:", allSubs.length);
  if (allSubs.length > 0) {
     console.log(allSubs.slice(0, 10));
  }
}
main().finally(() => prisma.$disconnect());

