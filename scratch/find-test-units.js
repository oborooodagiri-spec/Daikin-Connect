const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = ['AHU', 'Split', 'AC SPLIT', 'FCU'];
  const results = {};
  
  for (const t of types) {
    results[t] = await prisma.units.findFirst({
      where: { unit_type: { contains: t } },
      select: { qr_code_token: true, unit_type: true, tag_number: true }
    });
  }
  
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
