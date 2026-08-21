const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const gws = await prisma.modbus_gateways.findMany();
  for (const gw of gws) {
    console.log(gw.name, "last_seen_at:", gw.last_seen_at);
  }
  console.log("Current Date.now():", new Date(Date.now()));
  console.log("Current new Date():", new Date());
}
main().finally(() => prisma.$disconnect());