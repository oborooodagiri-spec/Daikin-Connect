const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const projects = await prisma.projects.findMany({
    where: { name: { contains: 'Lanud' } }
  });
  console.log('Projects matching "Lanud":');
  console.log(JSON.stringify(projects, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
  
  if (projects.length > 0) {
    const unitCount = await prisma.units.count({
      where: { project_ref_id: projects[0].id }
    });
    console.log(`\nUnit count for ${projects[0].name}: ${unitCount}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
