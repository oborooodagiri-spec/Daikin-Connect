const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up VRV categories...");

  // Get parent categories
  const vrv = await prisma.unit_type_categories.findFirst({ where: { name: 'VRV' } });
  if (!vrv) return console.log("VRV not found");

  const outdoor = await prisma.unit_type_categories.findFirst({ where: { name: 'Outdoor unit', parent_id: vrv.id } });
  if (!outdoor) return console.log("Outdoor unit not found");

  // 1. Move 'VRV 6A / VRV A', 'VRV IV-S', 'VRV-Q' to Outdoor unit
  const toMove = ['VRV 6A / VRV A', 'VRV IV-S', 'VRV-Q'];
  for (const name of toMove) {
    const cat = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: vrv.id } });
    if (cat) {
      await prisma.unit_type_categories.update({
        where: { id: cat.id },
        data: { parent_id: outdoor.id }
      });
      console.log(`Moved ${name} to Outdoor unit`);
    }
  }

  // 2. Delete the simplified ones we created in script 9 to avoid duplicates
  const toDeleteDups = ['VRV 6A', 'VRV A', 'VRV IV S', 'VRV Q'];
  for (const name of toDeleteDups) {
    const dup = await prisma.unit_type_categories.findFirst({ where: { name: name, parent_id: outdoor.id } });
    if (dup) {
      // Delete children first
      await prisma.unit_type_categories.deleteMany({ where: { parent_id: dup.id } });
      await prisma.unit_type_categories.delete({ where: { id: dup.id } });
      console.log(`Deleted duplicate ${name} from Outdoor unit`);
    }
  }

  // 3. Delete 'VRV Home Series' from under VRV
  const homeSeries = await prisma.unit_type_categories.findFirst({ where: { name: 'VRV Home Series', parent_id: vrv.id } });
  if (homeSeries) {
    // Delete children first
    await prisma.unit_type_categories.deleteMany({ where: { parent_id: homeSeries.id } });
    await prisma.unit_type_categories.delete({ where: { id: homeSeries.id } });
    console.log("Deleted VRV Home Series");
  }

  console.log("Done seeding part 10 (cleanup)!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
