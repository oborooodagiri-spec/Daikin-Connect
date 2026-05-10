const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const badNames = [
    'Unknown Tenant',
    'Kabel kompresor terbakar, tekanan drop, kompresor shirt body',
    'ACAII',
    'Koridor ACAII'
  ];
  
  const deletedActivities = await prisma.service_activities.deleteMany({
    where: {
      units: {
        room_tenant: { in: badNames }
      }
    }
  });
  console.log(`Deleted ${deletedActivities.count} accidental activities.`);

  const deletedUnits = await prisma.units.deleteMany({
    where: {
      room_tenant: { in: badNames }
    }
  });
  console.log(`Deleted ${deletedUnits.count} accidental units.`);
  
  process.exit(0);
}

cleanup();
