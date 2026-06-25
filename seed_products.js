const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding specific products to categories...");

  // Get parent categories
  const screw = await prisma.unit_type_categories.findFirst({ where: { name: 'Screw' } });
  const magnetic = await prisma.unit_type_categories.findFirst({ where: { name: 'Magnetic Centrifugal' } });
  const modular = await prisma.unit_type_categories.findFirst({ where: { name: 'Modular Chiller (Heat pump)' } });
  const mini = await prisma.unit_type_categories.findFirst({ where: { name: 'Mini Chiller (Heat Pump)' } });
  const waterHeater = await prisma.unit_type_categories.findFirst({ where: { name: 'Water Heater' } });

  // 1. Screw
  if (screw) {
    const screwProducts = [
      'UAY-CV3/CV8', 'UAA-ST3-RAD', 'UAA-CV3/CV8', 'UAY-SV3/SV8',
      'UAY-SQ3', 'UAA-ST3-FBD', 'UAA-ST3-FED', 'UAY-ST3-FBD'
    ];
    for (let i = 0; i < screwProducts.length; i++) {
      const exists = await prisma.unit_type_categories.findFirst({ where: { name: screwProducts[i], parent_id: screw.id } });
      if (!exists) {
        await prisma.unit_type_categories.create({
          data: { name: screwProducts[i], parent_id: screw.id, sort_order: i + 1 }
        });
      }
    }
    console.log("Added Screw products");
  }

  // 2. Magnetic Centrifugal
  if (magnetic) {
    const magneticProducts = ['UXEV-ST9', 'UXEV-ST3'];
    for (let i = 0; i < magneticProducts.length; i++) {
      const exists = await prisma.unit_type_categories.findFirst({ where: { name: magneticProducts[i], parent_id: magnetic.id } });
      if (!exists) {
        await prisma.unit_type_categories.create({
          data: { name: magneticProducts[i], parent_id: magnetic.id, sort_order: i + 1 }
        });
      }
    }
    console.log("Added Magnetic Centrifugal products");
  }

  // 3. Modular Chiller (Heat pump)
  if (modular) {
    const modularProducts = ['UAL-E R32', 'UAL-E R410A', 'UAL-D R410A'];
    for (let i = 0; i < modularProducts.length; i++) {
      const exists = await prisma.unit_type_categories.findFirst({ where: { name: modularProducts[i], parent_id: modular.id } });
      if (!exists) {
        await prisma.unit_type_categories.create({
          data: { name: modularProducts[i], parent_id: modular.id, sort_order: i + 1 }
        });
      }
    }
    console.log("Added Modular Chiller products");
  }

  // 4. Mini Chiller (Heat Pump)
  if (mini) {
    const miniProducts = ['Mini Chiller UAL-ER'];
    for (let i = 0; i < miniProducts.length; i++) {
      const exists = await prisma.unit_type_categories.findFirst({ where: { name: miniProducts[i], parent_id: mini.id } });
      if (!exists) {
        await prisma.unit_type_categories.create({
          data: { name: miniProducts[i], parent_id: mini.id, sort_order: i + 1 }
        });
      }
    }
    console.log("Added Mini Chiller products");
  }

  // 5. Water Heater
  if (waterHeater) {
    const heaterProducts = ['Water Heater UHA'];
    for (let i = 0; i < heaterProducts.length; i++) {
      const exists = await prisma.unit_type_categories.findFirst({ where: { name: heaterProducts[i], parent_id: waterHeater.id } });
      if (!exists) {
        await prisma.unit_type_categories.create({
          data: { name: heaterProducts[i], parent_id: waterHeater.id, sort_order: i + 1 }
        });
      }
    }
    console.log("Added Water Heater products");
  }

  console.log("All products seeded successfully!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
