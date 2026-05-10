const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function checkSpecificUnits() {
  const tenants = ["R. PANEL 001", "R. PANEL 002", "PAPILION DUO", "SAMSONITE", "COLUMBIA"];
  
  console.log("Checking specific units for early March 2026...");
  
  const activities = await prisma.service_activities.findMany({
    where: {
      units: {
        room_tenant: { in: tenants }
      },
      service_date: {
        gte: new Date('2026-03-01'),
        lte: new Date('2026-03-10')
      }
    },
    include: {
      units: true,
      _count: { select: { activity_photos: true } }
    }
  });

  activities.forEach(a => {
    console.log(`[${a.service_date.toISOString().split('T')[0]}] ${a.units?.room_tenant.padEnd(20)} | Photos: ${a._count.activity_photos} | URL: ${a.photo_url || 'NULL'}`);
  });

  await prisma.$disconnect();
}

checkSpecificUnits();
