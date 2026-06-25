const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding Screw and Refrigerating unit products under Water cooled Chiller...");

  // Get parent category: Water cooled Chiller
  const waterCooled = await prisma.unit_type_categories.findFirst({ where: { name: 'Water Cooled Chiller' } });
  if (!waterCooled) {
    console.log("Water Cooled Chiller not found");
    return;
  }

  // Create Level 2: Screw
  let screw = await prisma.unit_type_categories.findFirst({ where: { name: 'Screw', parent_id: waterCooled.id } });
  if (!screw) {
    screw = await prisma.unit_type_categories.create({ data: { name: 'Screw', parent_id: waterCooled.id, sort_order: 2 } });
  }

  // Create Level 2: Refrigerating unit
  let refUnit = await prisma.unit_type_categories.findFirst({ where: { name: 'Refrigerating unit', parent_id: waterCooled.id } });
  if (!refUnit) {
    refUnit = await prisma.unit_type_categories.create({ data: { name: 'Refrigerating unit', parent_id: waterCooled.id, sort_order: 3 } });
  }

  // Subcategories for Screw
  const screwSubs = [
    { name: 'ZUWV-GEN3 R134a/R1234ze(E)/R513A', childName: 'ZUWV-GEN3 R134a/R1234ze(E)/R513A', order: 1 },
    { name: 'ZUWS(High IPLV) R134a', childName: 'ZUWS(High IPLV) R134a', order: 2 },
  ];

  for (const sub of screwSubs) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub.name, parent_id: screw.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub.name, parent_id: screw.id, sort_order: sub.order } });
    }
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: sub.childName, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: sub.childName, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added product ${sub.childName} under ${sub.name} (Screw)`);
    }
  }

  // Subcategories for Refrigerating unit
  const refSubs = [
    { name: 'Semi-Hermetic Single-Screw Chiller', childName: 'Semi-Hermetic Single-Screw Chiller', order: 1 },
    { name: 'Open Single-Screw Chiller', childName: 'Open Single-Screw Chiller', order: 2 },
  ];

  for (const sub of refSubs) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub.name, parent_id: refUnit.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub.name, parent_id: refUnit.id, sort_order: sub.order } });
    }
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: sub.childName, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: sub.childName, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added product ${sub.childName} under ${sub.name} (Refrigerating unit)`);
    }
  }

  console.log("Done seeding part 6!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
