
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRaw`SELECT count(*) as cnt FROM wa_subscribers`;
  console.log("Raw count:", result);
  
  const projects = await prisma.$queryRaw`SELECT id, name, wa_invite_code FROM projects WHERE name LIKE "%Plaza Indonesia%" LIMIT 5`;
  console.log("Projects:", projects);
}
main().finally(() => prisma.$disconnect());

