const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// X & XI. SUPPORT PART LADDER & TRAY
items.push(
  { name: 'Jointing Set c/w mur & baut', category: 'Cable Support Accessories', unit: 'Set', specification: 'T: 100 mm', price: 24000 },
  { name: 'Jointing Set c/w mur & baut', category: 'Cable Support Accessories', unit: 'Set', specification: 'T: 50 mm', price: 20000 },
  { name: 'Jointing Set c/w mur & baut SLW', category: 'Cable Support Accessories', unit: 'Set', specification: 'T: 100 mm', price: 30000 },
  { name: 'Vertical Hinger', category: 'Cable Support Accessories', unit: 'Pcs', specification: '', price: 38000 },
  { name: 'Horizontal Hinger', category: 'Cable Support Accessories', unit: 'Pcs', specification: '', price: 38000 },
  
  // Bracket Support
  ...[50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000].map((w, i) => ({
    name: 'Bracket Support', category: 'Cable Support Accessories', unit: 'Pcs', specification: `W: ${w} mm`, 
    price: [23000, 27000, 32000, 37000, 47000, 58000, 71000, 87000, 117000, 129000, 136000, 150000, 161000][i]
  })),

  // Hanger Beam
  ...[100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((w, i) => ({
    name: 'Hanger Beam', category: 'Cable Support Accessories', unit: 'Pcs', specification: `W: ${w} mm`, 
    price: [23000, 26000, 28000, 36000, 44000, 58000, 69000, 80000, 87000, 92000, 99000][i]
  })),

  { name: 'Hanger Road', category: 'Cable Support Accessories', unit: 'Pcs', specification: 'Dia. 10mm P: 1m', price: 23000 },
  { name: 'Hanger Road', category: 'Cable Support Accessories', unit: 'Pcs', specification: 'Dia. 12mm P: 1m', price: 36000 },
  { name: 'Straight Separator', category: 'Cable Support Accessories', unit: 'Pcs', specification: 'H: 50mm', price: 119000 },
  { name: 'Straight Separator', category: 'Cable Support Accessories', unit: 'Pcs', specification: 'H: 100mm', price: 173000 },
  { name: 'Hold Down Clamp', category: 'Cable Support Accessories', unit: 'Pcs', specification: '', price: 18000 },
  { name: 'Hold Down Clip', category: 'Cable Support Accessories', unit: 'Pcs', specification: '', price: 6000 },

  // Clamp Cover
  ...[100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((w, i) => ({
    name: 'Clamp Cover', category: 'Cable Support Accessories', unit: 'Pcs', specification: `${w} mm`, 
    price: [24000, 23000, 28000, 32000, 39000, 42000, 60000, 63000, 67000, 72000, 78000][i]
  })),

  // End Stopper
  ...[100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((w, i) => ({
    name: 'End Stopper', category: 'Cable Support Accessories', unit: 'Pcs', specification: `${w} mm`, 
    price: [23000, 25000, 27000, 33000, 38000, 44000, 52000, 55000, 62000, 66000, 70000][i]
  }))
);

// I. METAL & II. PVC
items.push(
  // METAL - CHANNELS TYPE
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.7.7-2', price: 261000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.12.7-2', price: 321000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.15.9-2', price: 345000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.7.6.6-3', price: 345000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.12.6.6-3', price: 367000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.7.5.7.5.7.5-3', price: 357000 },
  { name: 'CHANNELS TYPE', category: 'Underfloor Duct Metal', unit: 'Meter', specification: 'CD.10.10.10-3', price: 381000 },
  
  { name: 'RISER', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'ALL TYPE', price: 350000 },
  { name: 'DUCT CONNECTOR', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'ALL TYPE', price: 60000 },
  
  // OUTLET BOX TYPE
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'M', price: 495000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'SS', price: 767000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'SB', price: 832000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'BS', price: 963000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'BB', price: 1050500 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'BSE', price: 688000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'BBE', price: 750000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'SSE', price: 563000 },
  { name: 'OUTLET BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'SBE', price: 625000 },

  // ACESSORIES
  { name: 'ACESSORIES', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'STOP KONTAK', price: 42000 },
  { name: 'ACESSORIES', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'OUTLET TELEPON', price: 60000 },
  { name: 'ACESSORIES', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'OUTLET DATA', price: 230000 },

  // JUNCTION BOX TYPE
  { name: 'JUNCTION BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'S', price: 525000 },
  { name: 'JUNCTION BOX TYPE', category: 'Underfloor Duct Metal', unit: 'Pcs', specification: 'B', price: 613000 },

  // PVC
  { name: 'CHANNELS PVC', category: 'Underfloor Duct PVC', unit: 'Meter', specification: 'UK. 1 x 75', price: 86000 },
  { name: 'CHANNELS PVC', category: 'Underfloor Duct PVC', unit: 'Meter', specification: 'UK. 1 x 100', price: 112000 },
  { name: 'FIXING CLIP', category: 'Underfloor Duct PVC', unit: 'Meter', specification: 'UK. 3 x 75', price: 36000 },
  { name: 'FIXING CLIP', category: 'Underfloor Duct PVC', unit: 'Meter', specification: 'UK. 3 x 100', price: 48000 }
);

// REDUCER SCH 40
const reducerData = {
  '3/4" X 1/2"': 9000,
  '1" X 3/4"': 10000, '1" X 1/2"': 10750,
  '1 1/4" X 3/4"': 11550, '1 1/4" X 1/2"': 13050, '1 1/4" X 1"': 15400,
  '1 1/2" X 1 1/2"': 25400, '1 1/2" X 3/4"': 17700, '1 1/2" X 1"': 16150, '1 1/2" X 1 1/4"': 20750,
  '2" X 1/2"': 24600, '2" X 3/4"': 25400, '2" X 1"': 29250, '2" X 1 1/4"': 25400, '2" X 1 1/2"': 39250,
  '2 1/2" X 1"': 36900, '2 1/2" X 1 1/4"': 41500, '2 1/2" X 1 1/2"': 46200, '2 1/2" X 2"': 53900,
  '3" X 1"': 44600, '3" X 1 1/4"': 49200, '3" X 1 1/2"': 53100, '3" X 2"': 62300, '3" X 2 1/2"': 77700,
  '4" X 1"': 64600, '4" X 1 1/4"': 70000, '4" X 1 1/2"': 77700, '4" X 2"': 90000, '4" X 2 1/2"': 103900, '4" X 3"': 120100,
  '5" X 1 1/2"': 116200, '5" X 2"': 123900, '5" X 2 1/2"': 130000, '5" X 3"': 150100, '5" X 4"': 180100,
  '6" X 1 1/2"': 150100, '6" X 2"': 157800, '6" X 2 1/2"': 166300, '6" X 3"': 181700, '6" X 4"': 200900, '6" X 5"': 217100,
  '8" X 2"': 292600, '8" X 2 1/2"': 308700, '8" X 3"': 324100, '8" X 4"': 347200, '8" X 5"': 385700, '8" X 6"': 478100,
  '10" X 3"': 439600, '10" X 4"': 478100, '10" X 5"': 516600, '10" X 6"': 562100, '10" X 8"': 678300,
  '12" X 4"': 678300, '12" X 5"': 716800, '12" X 6"': 770700, '12" X 8"': 847700, '12" X 10"': 963200,
  '14" X 4"': 1186500, '14" X 5"': 1271200, '14" X 6"': 1502200, '14" X 8"': 1617700, '14" X 10"': 1271200, '14" X 12"': 1848700,
  '16" X 6"': 1771700, '16" X 8"': 1856400, '16" X 10"': 2002700, '16" X 12"': 2118200, '16" X 14"': 2233700,
  '18" X 8"': 2464700, '18" X 10"': 2657200, '18" X 12"': 2811200, '18" X 14"': 3003700, '18" X 16"': 3234700,
  '20" X 8"': 3773700, '20" X 10"': 4005500, '20" X 12"': 4313500, '20" X 14"': 4544500, '20" X 16"': 4852500, '20" X 18"': 5699500,
  '24" X 10"': 5391500, '24" X 12"': 5545500, '24" X 14"': 5776500, '24" X 16"': 6084500, '24" X 18"': 6431000, '24" X 20"': 6662800, '24" X 22"': 6816800
};

for (const [size, price] of Object.entries(reducerData)) {
  items.push({
    name: 'REDUCER SCH 40',
    category: 'Pipe Fitting',
    unit: 'Pcs',
    specification: size,
    price: price
  });
}

async function main() {
  console.log(`Inserting ${items.length} items to Master Pricelist...`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const item of items) {
    const existing = await prisma.pricelist_items.findFirst({
      where: {
        name: item.name,
        specification: item.specification
      }
    });
    
    if (existing) {
      await prisma.pricelist_items.update({
        where: { id: existing.id },
        data: { price: item.price }
      });
      skipped++;
    } else {
      await prisma.pricelist_items.create({
        data: item
      });
      inserted++;
    }
  }
  
  console.log(`Finished! Inserted: ${inserted}, Updated (Skipped insert): ${skipped}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
