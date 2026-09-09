
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.projects.findFirst({ where: { name: { contains: "Plaza Indonesia" } } });
  console.log("Project:", p?.id, p?.name, p?.wa_invite_code);
  if (p) {
    const subs = await prisma.wa_subscribers.findMany({ where: { project_id: p.id } });
    console.log("Subs for project_id", p.id, ":", subs.length);
  }
  
  const pCode = await prisma.projects.findFirst({ where: { wa_invite_code: "JAK-YR5V" } });
  console.log("Project with Code JAK-YR5V:", pCode?.id, pCode?.name);
}
main().finally(() => prisma.$disconnect());

