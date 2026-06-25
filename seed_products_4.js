const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding HFO products from latest screenshots...");

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

  // Create HFO
  let hfo = await prisma.unit_type_categories.findFirst({ where: { name: 'HFO', parent_id: centrifugal.id } });
  if (!hfo) {
    hfo = await prisma.unit_type_categories.create({ data: { name: 'HFO', parent_id: centrifugal.id, sort_order: 1 } });
  }

  // Create Level 4 Subcategories
  const subCats = [
    { name: 'WMT R1233zd(E)', childName: 'WMT R1233zd(E)', order: 1 },
    { name: 'HXE-Danfoss R1234ze(E)', childName: 'HXE-TG Series', order: 2 },
    { name: 'WLT R1233zd(E)', childName: 'WLT Series', order: 3 },
    { name: 'WXF R1234ze(E)', childName: 'WXF R1234ze(E)', order: 4 },
  ];

  for (const sub of subCats) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub.name, parent_id: hfo.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub.name, parent_id: hfo.id, sort_order: sub.order } });
    }

    // Create the actual product card inside
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: sub.childName, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: sub.childName, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added product ${sub.childName} under ${sub.name}`);
    }
  }

  console.log("Done seeding part 4!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
