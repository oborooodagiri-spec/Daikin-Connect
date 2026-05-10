const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check(tenant) {
  try {
    const activities = await prisma.service_activities.findMany({
      where: { unit_id: 16158, type: 'Preventive' },
      orderBy: { service_date: 'desc' }
    });
    console.log(JSON.stringify(activities, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check('LE LABO 001');
