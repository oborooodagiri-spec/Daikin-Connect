const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding more products to 'Other commercial product' subcategories...");

  const cat1 = await prisma.unit_type_categories.findFirst({ where: { name: 'Inverter Condensing Unit' } });
  const cat2 = await prisma.unit_type_categories.findFirst({ where: { name: 'High-Temperature Heat Pump' } });
  const cat3 = await prisma.unit_type_categories.findFirst({ where: { name: 'Modular Water-Cooled Heat Pump' } });
  const cat4 = await prisma.unit_type_categories.findFirst({ where: { name: 'Water Source Heat Pump' } });
  const cat5 = await prisma.unit_type_categories.findFirst({ where: { name: 'Water-Cooled Package Unit' } });

  const dataToSeed = [
    { parent: cat1, products: ['URC'] },
    { parent: cat2, products: ['High-Temperature Heat Pump Unit'] },
    { parent: cat3, products: ['UWL'] },
    { parent: cat4, products: ['CRH R410A'] },
    { parent: cat5, products: ['UCCP R410A'] },
  ];

  for (const group of dataToSeed) {
    if (group.parent) {
      for (let i = 0; i < group.products.length; i++) {
        const pName = group.products[i];
        const exists = await prisma.unit_type_categories.findFirst({ where: { name: pName, parent_id: group.parent.id } });
        if (!exists) {
          await prisma.unit_type_categories.create({
            data: { name: pName, parent_id: group.parent.id, sort_order: i + 1 }
          });
        }
      }
      console.log(`Added products for ${group.parent.name}`);
    }
  }

  console.log("Done seeding part 2!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
