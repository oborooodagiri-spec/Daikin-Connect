
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    const p = await prisma.projects.findFirst({ where: { name: { contains: "Plaza Indonesia" } } });
    console.log("Project:", p?.id, p?.name, p?.project_code);
    
    if (p) {
      const subsByProj = await prisma.wa_subscribers.findMany({ where: { project_id: p.id } });
      console.log("Subs by project_id:", subsByProj.length, subsByProj);
      
      const subsByCode = await prisma.wa_subscribers.findMany({ where: { project_code: p.project_code } });
      console.log("Subs by project_code:", subsByCode.length, subsByCode);
    }
    
    const allSubs = await prisma.wa_subscribers.findMany({});
    console.log("All Subs Sample:", allSubs.slice(0, 5));
  } catch(e) { console.error(e) }
}
main().finally(() => prisma.$disconnect());

