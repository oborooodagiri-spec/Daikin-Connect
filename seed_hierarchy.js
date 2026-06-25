const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing categories...");
  await prisma.unit_type_categories.deleteMany({});
  
  console.log("Seeding new categories...");
  
  // Level 1
  const c1 = await prisma.unit_type_categories.create({
    data: { name: 'Air cooled Chiller', icon_color: '#0073ea', sort_order: 1 }
  });
  
  const c2 = await prisma.unit_type_categories.create({
    data: { name: 'Air side', icon_color: '#00c875', sort_order: 2 }
  });
  
  const c3 = await prisma.unit_type_categories.create({
    data: { name: 'Water cooled Chiller', icon_color: '#579bfc', sort_order: 3 }
  });
  
  const c4 = await prisma.unit_type_categories.create({
    data: { name: 'DX', icon_color: '#fdab3d', sort_order: 4 }
  });
  
  const c5 = await prisma.unit_type_categories.create({
    data: { name: 'Filter', icon_color: '#a25ddc', sort_order: 5 }
  });

  // Level 2 for Air cooled Chiller
  await prisma.unit_type_categories.create({
    data: { name: 'Screw', parent_id: c1.id, sort_order: 1 }
  });
  
  await prisma.unit_type_categories.create({
    data: { name: 'Magnetic Centrifugal', parent_id: c1.id, sort_order: 2 }
  });
  
  const scroll = await prisma.unit_type_categories.create({
    data: { name: 'Scroll', parent_id: c1.id, sort_order: 3 }
  });
  
  const other = await prisma.unit_type_categories.create({
    data: { name: 'Other commercial product', parent_id: c1.id, sort_order: 4 }
  });
  
  // Level 3 for Scroll
  await prisma.unit_type_categories.create({
    data: { name: 'Modular Chiller (Heat pump)', parent_id: scroll.id, sort_order: 1 }
  });
  await prisma.unit_type_categories.create({
    data: { name: 'Mini Chiller (Heat Pump)', parent_id: scroll.id, sort_order: 2 }
  });
  await prisma.unit_type_categories.create({
    data: { name: 'Water Heater', parent_id: scroll.id, sort_order: 3 }
  });
  
  // Level 3 for Other commercial product
  const others = [
    'Inverter Condensing Unit',
    'High-Temperature Heat Pump',
    'Modular Water-Cooled Heat Pump',
    'Water Source Heat Pump',
    'Water-Cooled Package Unit',
    'Water Cooled Screw Chiller',
    'Data Center Parts List'
  ];
  
  for (let i = 0; i < others.length; i++) {
    await prisma.unit_type_categories.create({
      data: { name: others[i], parent_id: other.id, sort_order: i + 1 }
    });
  }
  
  console.log("Done!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
