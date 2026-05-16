const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkAccess() {
  const PROJECT_ID = 5n;

  console.log("--- Project Details ---");
  const project = await prisma.projects.findUnique({ where: { id: PROJECT_ID } });
  console.log(JSON.stringify(project, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  console.log("\n--- User Access for this Project ---");
  const access = await prisma.user_project_access.findMany({
    where: { project_id: PROJECT_ID },
    include: { users: { select: { id: true, name: true, email: true } } }
  });
  console.log(JSON.stringify(access, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  console.log("\n--- Units Count for this Project ---");
  const count = await prisma.units.count({ where: { project_ref_id: PROJECT_ID } });
  console.log(`Total units with project_ref_id 5: ${count}`);

  await prisma.$disconnect();
}

checkAccess().catch(console.error);
