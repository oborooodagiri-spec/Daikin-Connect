const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// CABLES - MULIA KABEL (KABELINDO)
const cableSizes = [
  '1x185 mm2', '1x240 mm2', '1x300 mm2', '1x400 mm2', '1x500 mm2', '1x630 mm2',
  '2x0.75 mm2', '2x1.5 mm2', '2x2.5 mm2', '2x4 mm2', '2x6 mm2', '2x10 mm2', '2x16 mm2', '2x25 mm2', '2x35 mm2', '2x50 mm2', '2x70 mm2', '2x95 mm2', '2x120 mm2',
  '3x1.5 mm2', '3x2.5 mm2', '3x4 mm2', '3x6 mm2', '3x10 mm2', '3x16 mm2', '3x25 mm2', '3x35 mm2', '3x50 mm2'
];

const cableTypes = [
  'NYA', 'NYAF', 'NYM', 'NYY', 'NYMHY / NYYHY', 
  'NYR / NYFGBY 0.6/1kV', 'N2XSY 12/20(24)KV', 'N2XSEFGBY 12/20(24)KV'
];

const pricesData = {
  '1x185 mm2': { 'NYA': 628000, 'NYAF': 300000, 'NYY': 628500, 'N2XSY 12/20(24)KV': 386080 },
  '1x240 mm2': { 'NYA': 826000, 'NYAF': 400000, 'NYY': 825500, 'N2XSY 12/20(24)KV': 570000 },
  '1x300 mm2': { 'NYA': 1030000, 'NYAF': 500000, 'NYY': 1031500, 'N2XSY 12/20(24)KV': 443000 },
  '1x400 mm2': { 'NYA': 1315000, 'NYY': 1310000, 'N2XSY 12/20(24)KV': 864880 },
  '1x500 mm2': { 'NYY': 1674000, 'N2XSY 12/20(24)KV': 1088320 },
  '1x630 mm2': { 'NYY': 2221000, 'N2XSY 12/20(24)KV': 881000 },
  '2x0.75 mm2': { 'NYMHY / NYYHY': 10000, 'N2XSY 12/20(24)KV': 881000 },
  '2x1.5 mm2': { 'NYM': 16700, 'NYY': 20000, 'NYMHY / NYYHY': 15700, 'NYR / NYFGBY 0.6/1kV': 12500 },
  '2x2.5 mm2': { 'NYM': 23800, 'NYY': 27600, 'NYMHY / NYYHY': 24800, 'NYR / NYFGBY 0.6/1kV': 14500 },
  '2x4 mm2': { 'NYM': 35800, 'NYY': 42600, 'NYMHY / NYYHY': 36300, 'NYR / NYFGBY 0.6/1kV': 18500 },
  '2x6 mm2': { 'NYM': 48300, 'NYY': 55000, 'NYMHY / NYYHY': 52000, 'NYR / NYFGBY 0.6/1kV': 25000 },
  '2x10 mm2': { 'NYM': 80000, 'NYY': 86000, 'NYMHY / NYYHY': 90000, 'NYR / NYFGBY 0.6/1kV': 33000 },
  '2x16 mm2': { 'NYY': 136000, 'NYR / NYFGBY 0.6/1kV': 172500 },
  '2x25 mm2': { 'NYY': 204500, 'NYR / NYFGBY 0.6/1kV': 249500 },
  '2x35 mm2': { 'NYY': 265500, 'NYR / NYFGBY 0.6/1kV': 326000 },
  '2x50 mm2': { 'NYY': 366000, 'NYR / NYFGBY 0.6/1kV': 426000 },
  '2x70 mm2': { 'NYY': 517500, 'NYR / NYFGBY 0.6/1kV': 591500 },
  '2x95 mm2': { 'NYY': 709500, 'NYR / NYFGBY 0.6/1kV': 802500 },
  '2x120 mm2': { 'NYY': 884000, 'NYR / NYFGBY 0.6/1kV': 985500 },
  '3x1.5 mm2': { 'NYM': 21500, 'NYY': 25000, 'NYMHY / NYYHY': 23600, 'NYR / NYFGBY 0.6/1kV': 14000 },
  '3x2.5 mm2': { 'NYM': 31000, 'NYY': 35800, 'NYMHY / NYYHY': 33800, 'NYR / NYFGBY 0.6/1kV': 17000 },
  '3x4 mm2': { 'NYM': 47800, 'NYY': 55000, 'NYMHY / NYYHY': 54100, 'NYR / NYFGBY 0.6/1kV': 24500 },
  '3x6 mm2': { 'NYM': 69300, 'NYY': 76500, 'NYMHY / NYYHY': 76600, 'NYR / NYFGBY 0.6/1kV': 30000 },
  '3x10 mm2': { 'NYM': 114600, 'NYY': 124200, 'NYMHY / NYYHY': 128500, 'NYR / NYFGBY 0.6/1kV': 40000 },
  '3x16 mm2': { 'NYY': 190000, 'NYR / NYFGBY 0.6/1kV': 228500 },
  '3x25 mm2': { 'NYY': 291500, 'NYR / NYFGBY 0.6/1kV': 340000, 'N2XSY 12/20(24)KV': 311000, 'N2XSEFGBY 12/20(24)KV': 350000 },
  '3x35 mm2': { 'NYY': 392500, 'NYR / NYFGBY 0.6/1kV': 452000, 'N2XSY 12/20(24)KV': 343000, 'N2XSEFGBY 12/20(24)KV': 380000 },
  '3x50 mm2': { 'NYY': 509500, 'NYR / NYFGBY 0.6/1kV': 573500, 'N2XSY 12/20(24)KV': 400000, 'N2XSEFGBY 12/20(24)KV': 450000 },
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
