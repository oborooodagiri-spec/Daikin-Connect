const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding detailed VRV Outdoor and Indoor units...");

  // Get parent category: DX -> VRV
  const dxCat = await prisma.unit_type_categories.findFirst({ where: { name: 'DX' } });
  if (!dxCat) {
    console.log("DX category not found");
    return;
  }

  let vrv = await prisma.unit_type_categories.findFirst({ where: { name: 'VRV', parent_id: dxCat.id } });
  if (!vrv) {
    vrv = await prisma.unit_type_categories.create({ data: { name: 'VRV', parent_id: dxCat.id, sort_order: 10 } });
  }

  // Create Outdoor unit
  let outdoor = await prisma.unit_type_categories.findFirst({ where: { name: 'Outdoor unit', parent_id: vrv.id } });
  if (!outdoor) {
    outdoor = await prisma.unit_type_categories.create({ data: { name: 'Outdoor unit', parent_id: vrv.id, sort_order: 1 } });
  }

  // Create Indoor unit
  let indoor = await prisma.unit_type_categories.findFirst({ where: { name: 'Indoor unit', parent_id: vrv.id } });
  if (!indoor) {
    indoor = await prisma.unit_type_categories.create({ data: { name: 'Indoor unit', parent_id: vrv.id, sort_order: 2 } });
  }

  const outdoorUnits = [
    'VRV 6A', 'VRV 6X', 'VRV X', 'VRV A', 'VRV IV S', 'VRV Q', 'VRV HRHW', 'VRV IV W'
  ];

  const indoorUnits = [
    'Ceiling Mounted Cassette Duct', 'Ceiling Mounted Cassette', 'Single Flow Cassette Type',
    'Slim Duct Compact Type', 'Bedroom Duct Type', 'Slim Duct Standard Type',
    'Middle-High Static Pressure Duct Type', 'High Static Pressure Duct Type',
    'Middle Static Pressure Duct Type', 'Wall Mounted', 'Ceiling Suspended',
    'Floor Standing Type', 'Floor Standing Duct', 'Concealed Floor Standing',
    'Clean Room Air Conditioner', 'Air Handling Unit'
  ];

  // Seed Outdoor Units
  let outOrder = 1;
  for (const name of outdoorUnits) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: outdoor.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: name, parent_id: outdoor.id, sort_order: outOrder } });
    }
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: name, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added Outdoor VRV: ${name}`);
    }
    outOrder++;
  }

  // Seed Indoor Units
  let inOrder = 1;
  for (const name of indoorUnits) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: indoor.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: name, parent_id: indoor.id, sort_order: inOrder } });
    }
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: name, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added Indoor VRV: ${name}`);
    }
    inOrder++;
  }

  console.log("Done seeding part 9!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
