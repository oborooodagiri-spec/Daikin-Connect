const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Adding products from latest screenshots...");

  // 1. Existing subcategories under 'Other commercial product'
  const waterScrew = await prisma.unit_type_categories.findFirst({ where: { name: 'Water Cooled Screw Chiller' } });
  const dataCenter = await prisma.unit_type_categories.findFirst({ where: { name: 'Data Center Parts List' } });

  if (waterScrew) {
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: 'UAAW-ST3-FAA', parent_id: waterScrew.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: 'UAAW-ST3-FAA', parent_id: waterScrew.id, sort_order: 1 } });
      console.log("Added products for Water Cooled Screw Chiller");
    }
  }
  if (dataCenter) {
    const exists = await prisma.unit_type_categories.findFirst({ where: { name: 'Data Center Parts List', parent_id: dataCenter.id } });
    if (!exists) {
      await prisma.unit_type_categories.create({ data: { name: 'Data Center Parts List', parent_id: dataCenter.id, sort_order: 1 } });
      console.log("Added products for Data Center Parts List");
    }
  }

  // 2. New subcategories under 'Air side'
  const airSide = await prisma.unit_type_categories.findFirst({ where: { name: 'Air side' } });
  if (airSide) {
    let ahuCat = await prisma.unit_type_categories.findFirst({ where: { name: 'Air Handling Unit', parent_id: airSide.id } });
    if (!ahuCat) ahuCat = await prisma.unit_type_categories.create({ data: { name: 'Air Handling Unit', parent_id: airSide.id, sort_order: 1 } });

    let fcuCat = await prisma.unit_type_categories.findFirst({ where: { name: 'Fan Coil Unit', parent_id: airSide.id } });
    if (!fcuCat) fcuCat = await prisma.unit_type_categories.create({ data: { name: 'Fan Coil Unit', parent_id: airSide.id, sort_order: 2 } });

    let thermoCat = await prisma.unit_type_categories.findFirst({ where: { name: 'Thermostat', parent_id: airSide.id } });
    if (!thermoCat) thermoCat = await prisma.unit_type_categories.create({ data: { name: 'Thermostat', parent_id: airSide.id, sort_order: 3 } });

    // Products for AHU
    const ahu1 = await prisma.unit_type_categories.findFirst({ where: { name: 'AHU', parent_id: ahuCat.id } });
    if (!ahu1) await prisma.unit_type_categories.create({ data: { name: 'AHU', parent_id: ahuCat.id, sort_order: 1 } });

    const ahu2 = await prisma.unit_type_categories.findFirst({ where: { name: 'FUW-F', parent_id: ahuCat.id } });
    if (!ahu2) await prisma.unit_type_categories.create({ data: { name: 'FUW-F', parent_id: ahuCat.id, sort_order: 2 } });
    
    // Products for FCU
    const fcu1 = await prisma.unit_type_categories.findFirst({ where: { name: 'Fan Coil Unit', parent_id: fcuCat.id } });
    if (!fcu1) await prisma.unit_type_categories.create({ data: { name: 'Fan Coil Unit', parent_id: fcuCat.id, sort_order: 1 } });

    // Products for Thermostat
    const thermo1 = await prisma.unit_type_categories.findFirst({ where: { name: 'Thermostat', parent_id: thermoCat.id } });
    if (!thermo1) await prisma.unit_type_categories.create({ data: { name: 'Thermostat', parent_id: thermoCat.id, sort_order: 1 } });

    console.log("Added subcategories and products for Air side");
  }

  console.log("Done seeding part 3!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
