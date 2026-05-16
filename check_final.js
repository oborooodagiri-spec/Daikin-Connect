const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkFinal() {
  const PROJECT_ID = 5n;
  const count = await prisma.units.count({
    where: { project_ref_id: PROJECT_ID }
  });
  console.log(`Total Units for Project 5: ${count}`);

  const types = await prisma.units.groupBy({
    by: ['unit_type'],
    where: { project_ref_id: PROJECT_ID },
    _count: true
  });
  console.log("Types in DB:", JSON.stringify(types, null, 2));

  const project = await prisma.projects.findUnique({
    where: { id: PROJECT_ID },
    select: { enabled_unit_types: true }
  });
  console.log(`Project Enabled Types: ${project.enabled_unit_types}`);

  await prisma.$disconnect();
}

checkFinal().catch(console.error);
