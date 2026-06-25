const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding HFC products from latest screenshots...");

  // Get parent category: Water cooled Chiller -> Centrifugal
  const waterCooled = await prisma.unit_type_categories.findFirst({ where: { name: 'Water Cooled Chiller' } });
  if (!waterCooled) {
    console.log("Water Cooled Chiller not found");
    return;
  }

  let centrifugal = await prisma.unit_type_categories.findFirst({ where: { name: 'Centrifugal', parent_id: waterCooled.id } });
  if (!centrifugal) {
    centrifugal = await prisma.unit_type_categories.create({ data: { name: 'Centrifugal', parent_id: waterCooled.id, sort_order: 1 } });
  }

  // Create HFC
  let hfc = await prisma.unit_type_categories.findFirst({ where: { name: 'HFC', parent_id: centrifugal.id } });
  if (!hfc) {
    hfc = await prisma.unit_type_categories.create({ data: { name: 'HFC', parent_id: centrifugal.id, sort_order: 2 } });
  }

  // Create Level 4 Subcategories
  const subCats = [
    { name: 'HXE-Danfoss R134a', childName: 'HXE-TT Series', order: 1 },
    { name: 'HXE-Daikin R134a', childName: 'HXE-Daikin R134a', order: 2 },
    { name: 'WTCC R134a', childName: 'WTCC R134a', order: 3 },
    { name: 'HTS/HTC R134a', childName: 'HTS R134a', order: 4 },
    { name: 'WTCV R134a/R1234ze(E)', childName: 'WTCV R134a/R1234ze(E)', order: 5 },
  ];

  for (const sub of subCats) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub.name, parent_id: hfc.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub.name, parent_id: hfc.id, sort_order: sub.order } });
    }

    // Create the actual product card inside
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: sub.childName, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: sub.childName, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added product ${sub.childName} under ${sub.name}`);
    }
  }

  console.log("Done seeding part 5!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
