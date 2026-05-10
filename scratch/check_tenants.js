const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function check() {
  const tenants = [
    'LOVE & FAIR', 'HOUSE OF ULTIMATE', 'GION', 'EATLAH', 'SO THAI', 
    'FRED FERRY', 'GUARDIAN', 'NUDIE JEANS', 'GYUKAKU', 'SEBASTIAN RED', 
    'AIGNER', 'BIMBI', 'GUCCI', 'FAURE LE PAGE', 'VALENTINO', 
    'TORRY BURCH', 'ROLEX', 'JADE', 'MISSIONI', 'LANVIN', 
    'OSTERIA GHIA', 'OPI'
  ];
  
  const units = await prisma.units.findMany({
    where: {
      OR: tenants.map(t => ({ room_tenant: { contains: t } }))
    }
  });

  units.forEach(u => {
    console.log(`Tenant: ${u.room_tenant} | Type: ${u.unit_type}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
