const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function check() {
  const acts = await prisma.service_activities.findMany({
    where: { units: { project_ref_id: 1, unit_type: 'AHU' }, type: 'Preventive', service_date: { gte: new Date('2026-05-01') } },
    take: 1
  });
  console.log(acts[0].technical_json);
}
check().finally(() => prisma.$disconnect());
