const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  const unit = await prisma.units.findFirst({
    where: { tag_number: 'DKN002078' },
    include: {
      activities: {
        where: { type: 'Preventive' },
        orderBy: { service_date: 'desc' },
        take: 1
      }
    }
  });
  console.log(JSON.stringify(unit, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
