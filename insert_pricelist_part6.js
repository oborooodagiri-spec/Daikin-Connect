const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // ELBOW PVC SCH 40
  ...['24"', '22"', '20"', '18"', '16"', '14"', '12"', '10"', '8"', '6"', '5"', '4"', '3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"'].map((size, i) => ({
    name: 'ELBOW PVC SCH 40', category: 'Fitting', unit: 'Pcs', specification: size,
    price: [4025000, 3500000, 3397000, 3051000, 1850000, 1857000, 1720000, 1233000, 823000, 360000, 245000, 145000, 67000, 50000, 28000, 15000, 12000, 9000, 5000, 5000][i]
  })),

  // FLANGE 10K SCH 40
  ...['24"', '22"', '20"', '18"', '16"', '14"', '12"', '10"', '8"', '6"', '5"', '4"', '3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"'].map((size, i) => ({
    name: 'FLANGE 10K SCH 40', category: 'Flange', unit: 'Pcs', specification: size,
    price: [1150000, 1000000, 800000, 590000, 540000, 425000, 310000, 200000, 135000, 125000, 115000, 79000, 64000, 61000, 50000, 44000, 37000, 37000, 27000, 23000][i]
  })),

  // BLIND FLANGE 10K SCH 40
  ...['24"', '22"', '20"', '18"', '16"', '14"', '12"', '10"', '8"', '6"', '5"', '4"', '3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"'].map((size, i) => ({
    name: 'BLIND FLANGE 10K SCH 40', category: 'Flange', unit: 'Pcs', specification: size,
    price: [3300000, 2500000, 2400000, 1850000, 1350000, 1100000, 800000, 680000, 425000, 290000, 210000, 115000, 105000, 90000, 75000, 65000, 52000, 44000, 35000, 33000][i]
  })),

  // FLANGE PN16 SCH 40
  ...['24"', '22"', '20"', '18"', '16"', '14"', '12"', '10"', '8"', '6"', '5"', '4"', '3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"'].map((size, i) => ({
    name: 'FLANGE PN16 SCH 40', category: 'Flange', unit: 'Pcs', specification: size,
    price: [2400000, 0, 1800000, 1500000, 1050000, 830000, 600000, 450000, 285000, 195000, 160000, 120000, 110000, 95000, 78000, 65000, 57000, 48000, 38000, 29000][i]
  })),

  // BLIND FLANGE PN16 SCH 40
  ...['24"', '22"', '20"', '18"', '16"', '14"', '12"', '10"', '8"', '6"', '5"', '4"', '3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"'].map((size, i) => ({
    name: 'BLIND FLANGE PN16 SCH 40', category: 'Flange', unit: 'Pcs', specification: size,
    price: [5650000, 0, 3700000, 2500000, 2100000, 1600000, 1100000, 850000, 560000, 340000, 260000, 175000, 160000, 150000, 95000, 85000, 70000, 50000, 52000, 30000][i]
  })),
];

// CABLES - MULIA KABEL (KABELINDO)
const cableSizes = [
  '1.5 mm2', '2.5 mm2', '4 mm2', '6 mm2', '10 mm2', 
  '1x0.75 mm2', '1x1.5 mm2', '1x2.5 mm2', '1x4 mm2', '1x6 mm2', 
  '1x10 mm2', '1x16 mm2', '1x25 mm2', '1x35 mm2', '1x50 mm2', 
  '1x70 mm2', '1x95 mm2', '1x120 mm2', '1x150 mm2'
];

const cableTypes = [
  'NYA', 'NYAF', 'NYM', 'NYY', 'NYMHY / NYYHY', 
  'NYR / NYFGBY 0.6/1kV', 'N2XSY 12/20(24)KV', 'N2XSEFGBY 12/20(24)KV'
];

const pricesData = {
  '1.5 mm2': { 'NYA': 5300, 'NYMHY / NYYHY': 6200 },
  '2.5 mm2': { 'NYA': 8700 },
  '4 mm2': { 'NYA': 13700 },
  '6 mm2': { 'NYA': 30704, 'NYAF': 16720 }, // Based on yellow cells in images
  '10 mm2': { 'NYA': 33500 },
  '1x0.75 mm2': { 'NYAF': 2584 },
  '1x1.5 mm2': { 'NYAF': 4256 },
  '1x2.5 mm2': { 'NYAF': 7296 },
  '1x4 mm2': { 'NYAF': 16720 },
  '1x6 mm2': { 'NYAF': 16720 },
  '1x10 mm2': { 'NYAF': 28120 },
  '1x16 mm2': { 'NYA': 57000, 'NYAF': 26000, 'NYY': 60500 },
  '1x25 mm2': { 'NYA': 88500, 'NYAF': 40000, 'NYY': 92300 },
  '1x35 mm2': { 'NYA': 121500, 'NYAF': 55000, 'NYY': 124500, 'N2XSY 12/20(24)KV': 159600 },
  '1x50 mm2': { 'NYA': 162000, 'NYAF': 79000, 'NYY': 166000, 'N2XSY 12/20(24)KV': 183920 },
  '1x70 mm2': { 'NYA': 234000, 'NYAF': 112000, 'NYY': 265000, 'N2XSY 12/20(24)KV': 218880 },
  '1x95 mm2': { 'NYA': 323000, 'NYAF': 153000, 'NYY': 327000, 'N2XSY 12/20(24)KV': 273600 },
  '1x120 mm2': { 'NYA': 406000, 'NYAF': 192000, 'NYY': 410500, 'N2XSY 12/20(24)KV': 322240 },
  '1x150 mm2': { 'NYA': 503000, 'NYAF': 0, 'NYY': 504500, 'N2XSY 12/20(24)KV': 322240 }
};

for (const size of cableSizes) {
  for (const type of cableTypes) {
    items.push({
      name: `KABEL ${type}`,
      category: 'Electrical Cable',
      unit: 'Meter',
      specification: size,
      price: pricesData[size]?.[type] || 0
    });
  }
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
