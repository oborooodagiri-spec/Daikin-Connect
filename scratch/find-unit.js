const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unit = await prisma.units.findFirst({
    where: { room_tenant: { contains: 'B1-12' } },
    select: { qr_code_token: true, tag_number: true }
  });
  console.log(JSON.stringify(unit, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
