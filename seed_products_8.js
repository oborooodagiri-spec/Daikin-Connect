const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding VRV products...");

  // Get parent category: DX -> VRV
  const dxCat = await prisma.unit_type_categories.findFirst({ where: { name: 'DX' } });
  if (!dxCat) {
    console.log("DX category not found");
    return;
  }

  let vrv = await prisma.unit_type_categories.findFirst({ where: { name: 'VRV', parent_id: dxCat.id } });
  if (!vrv) {
    console.log("VRV category not found, creating...");
    vrv = await prisma.unit_type_categories.create({ data: { name: 'VRV', parent_id: dxCat.id, sort_order: 10 } });
  }

  const vrvSubs = [
    { name: 'VRV 6A / VRV A', childName: 'VRV 6A / VRV A Series', order: 1 },
    { name: 'VRV IV-S', childName: 'VRV IV-S Series', order: 2 },
    { name: 'VRV-Q', childName: 'VRV-Q Series', order: 3 },
    { name: 'VRV Home Series', childName: 'VRV Home Series', order: 4 },
  ];

  for (const sub of vrvSubs) {
    let cat = await prisma.unit_type_categories.findFirst({ where: { name: sub.name, parent_id: vrv.id } });
    if (!cat) {
      cat = await prisma.unit_type_categories.create({ data: { name: sub.name, parent_id: vrv.id, sort_order: sub.order } });
    }
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: sub.childName, parent_id: cat.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: sub.childName, parent_id: cat.id, sort_order: 1 } });
      console.log(`Added product ${sub.childName} under ${sub.name} (VRV)`);
    }
  }

  console.log("Done seeding part 8!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
