const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const units = await prisma.units.findMany({
    where: { project_ref_id: 4, unit_type: { contains: 'Chiller' } },
    take: 5
  });
  console.log('Chiller Units:');
  console.log(JSON.stringify(units, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
