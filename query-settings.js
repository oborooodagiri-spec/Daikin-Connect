
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const allSettings = await prisma.pipeline_settings.findMany();
  console.log("Settings:", allSettings);
}
main().finally(() => prisma.$disconnect());

