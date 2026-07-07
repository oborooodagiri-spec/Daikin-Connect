const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// CABLES - MULIA KABEL (KABELINDO)
const cableSizes = [
  '3x70 mm2', '3x95 mm2', '3x120 mm2', '3x150 mm2', '3x185 mm2', '3x240 mm2', '3x300 mm2', '3x400 mm2',
  '4x0.75 mm2', '4x1.5 mm2', '4x2.5 mm2', '4x4 mm2', '4x6 mm2', '4x10 mm2', '4x16 mm2', '4x25 mm2', '4x35 mm2', '4x50 mm2',
  '4x70 mm2', '4x95 mm2', '4x120 mm2', '4x150 mm2', '4x185 mm2', '4x240 mm2', '4x300 mm2',
  '5x1.5 mm2', '7x1.5 mm2', '10x1.5 mm2', '12x1.5 mm2', '19x1.5 mm2'
];

const cableTypes = [
  'NYA', 'NYAF', 'NYM', 'NYY', 'NYMHY / NYYHY', 
  'NYR / NYFGBY 0.6/1kV', 'N2XSY 12/20(24)KV', 'N2XSEFGBY 12/20(24)KV'
];

const pricesData = {
  '3x70 mm2': { 'NYY': 731500, 'NYR / NYFGBY 0.6/1kV': 799000, 'N2XSY 12/20(24)KV': 493000, 'N2XSEFGBY 12/20(24)KV': 550000 },
  '3x95 mm2': { 'NYY': 1005000, 'NYR / NYFGBY 0.6/1kV': 1090000, 'N2XSY 12/20(24)KV': 612000, 'N2XSEFGBY 12/20(24)KV': 680000 },
  '3x120 mm2': { 'NYY': 1257000, 'NYR / NYFGBY 0.6/1kV': 1358000, 'N2XSY 12/20(24)KV': 728000, 'N2XSEFGBY 12/20(24)KV': 815000 },
  '3x150 mm2': { 'NYY': 1557000, 'NYR / NYFGBY 0.6/1kV': 1661500, 'N2XSY 12/20(24)KV': 839000, 'N2XSEFGBY 12/20(24)KV': 939000 },
  '3x185 mm2': { 'NYY': 1937000, 'NYR / NYFGBY 0.6/1kV': 2055500, 'N2XSY 12/20(24)KV': 997000, 'N2XSEFGBY 12/20(24)KV': 1100000 },
  '3x240 mm2': { 'NYY': 2538500, 'NYR / NYFGBY 0.6/1kV': 2700000, 'N2XSY 12/20(24)KV': 1268000, 'N2XSEFGBY 12/20(24)KV': 1367000 },
  '3x300 mm2': { 'NYY': 3202500, 'NYR / NYFGBY 0.6/1kV': 3355000, 'N2XSY 12/20(24)KV': 1520000, 'N2XSEFGBY 12/20(24)KV': 1640000 },
  '3x400 mm2': { 'N2XSY 12/20(24)KV': 1861000, 'N2XSEFGBY 12/20(24)KV': 2000000 },
  '4x0.75 mm2': { 'NYMHY / NYYHY': 24800, 'N2XSY 12/20(24)KV': 1861000, 'N2XSEFGBY 12/20(24)KV': 2000000 }, // Using values exactly as displayed in the image despite probable copy-paste errors
  '4x1.5 mm2': { 'NYM': 26300, 'NYY': 31000, 'NYMHY / NYYHY': 30300, 'NYR / NYFGBY 0.6/1kV': 16000 },
  '4x2.5 mm2': { 'NYM': 40600, 'NYY': 47700, 'NYMHY / NYYHY': 47300, 'NYR / NYFGBY 0.6/1kV': 20000 },
  '4x4 mm2': { 'NYM': 64500, 'NYY': 71600, 'NYMHY / NYYHY': 67800, 'NYR / NYFGBY 0.6/1kV': 29000 },
  '4x6 mm2': { 'NYM': 90800, 'NYY': 100300, 'NYMHY / NYYHY': 99200, 'NYR / NYFGBY 0.6/1kV': 36000 },
  '4x10 mm2': { 'NYM': 150500, 'NYY': 160000, 'NYMHY / NYYHY': 168000, 'NYR / NYFGBY 0.6/1kV': 49000 },
  '4x16 mm2': { 'NYY': 247000, 'NYR / NYFGBY 0.6/1kV': 292000 },
  '4x25 mm2': { 'NYY': 380000, 'NYR / NYFGBY 0.6/1kV': 453000 },
  '4x35 mm2': { 'NYY': 517500, 'NYR / NYFGBY 0.6/1kV': 577000 },
  '4x50 mm2': { 'NYY': 687000, 'NYR / NYFGBY 0.6/1kV': 754500 },
  '4x70 mm2': { 'NYY': 974500, 'NYR / NYFGBY 0.6/1kV': 1054500 },
  '4x95 mm2': { 'NYY': 1342000, 'NYR / NYFGBY 0.6/1kV': 1440000 },
  '4x120 mm2': { 'NYY': 1686500, 'NYR / NYFGBY 0.6/1kV': 1802000 },
  '4x150 mm2': { 'NYY': 2075000, 'NYR / NYFGBY 0.6/1kV': 2207500 },
  '4x185 mm2': { 'NYY': 2588000, 'NYR / NYFGBY 0.6/1kV': 2733500 },
  '4x240 mm2': { 'NYY': 3408000, 'NYR / NYFGBY 0.6/1kV': 3571500 },
  '4x300 mm2': { 'NYY': 4251500, 'NYR / NYFGBY 0.6/1kV': 4446500 },
  '5x1.5 mm2': { 'NYY': 12000 },
  '7x1.5 mm2': { 'NYY': 15000 },
  '10x1.5 mm2': { 'NYY': 30400 },
  '12x1.5 mm2': { 'NYY': 23000 },
  '19x1.5 mm2': { 'NYY': 33000 },
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
