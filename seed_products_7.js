const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding DX categories from latest screenshot...");

  // Get parent category: DX
  const dxCat = await prisma.unit_type_categories.findFirst({ where: { name: 'DX' } });
  if (!dxCat) {
    console.log("DX category not found");
    return;
  }

  const subCats = [
    'Air Purifiers',
    'Air Treatment',
    'Controller & Accessories',
    'Multi Split',
    'Others',
    'Packaged',
    'Refrigeration',
    'Single Split Room Air',
    'Sky Air',
    'VRV'
  ];

  let order = 1;
  for (const sub of subCats) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub, parent_id: dxCat.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub, parent_id: dxCat.id, sort_order: order } });
      console.log(`Added ${sub} under DX`);
    } else {
      console.log(`${sub} already exists under DX`);
    }
    order++;
  }

  console.log("Done seeding part 7!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
