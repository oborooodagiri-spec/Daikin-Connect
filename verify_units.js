const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function verifyUnits() {
  const units = await prisma.units.findMany({
    where: { project_ref_id: 5n },
    take: 5
  });
  
  console.log("--- Sample Units ---");
  console.log(JSON.stringify(units, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  const count = await prisma.units.count({
    where: { project_ref_id: 5n }
  });
  console.log(`\nTotal units for project_ref_id 5: ${count}`);

  // Check if there are units with project_id "5" (string)
  const countString = await prisma.units.count({
    where: { project_id: "5" }
  });
  console.log(`Total units for project_id "5" (string): ${countString}`);

  await prisma.$disconnect();
}

verifyUnits().catch(console.error);
