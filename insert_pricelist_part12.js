const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// Flexible Rubber Tozen
const addTozen = (size, prices) => {
  if (prices.drat) items.push({ name: 'Flexible Rubber Tozen - Twinflex Drat BSPT', category: 'Valve', unit: 'Pcs', specification: size, price: prices.drat });
  if (prices.jis10k) items.push({ name: 'Flexible Rubber Tozen - Twinflex D/I Flange JIS 10K', category: 'Valve', unit: 'Pcs', specification: size, price: prices.jis10k });
  if (prices.pn16k) items.push({ name: 'Flexible Rubber Tozen - Twinflex D/I Flange PN 16K', category: 'Valve', unit: 'Pcs', specification: size, price: prices.pn16k });
  if (prices.jis16kMS) items.push({ name: 'Flexible Rubber Tozen - Twinflex JIS 16K,MS Flange', category: 'Valve', unit: 'Pcs', specification: size, price: prices.jis16kMS });
  if (prices.jis20kMS) items.push({ name: 'Flexible Rubber Tozen - Twinflex JIS 20K,MS Flange', category: 'Valve', unit: 'Pcs', specification: size, price: prices.jis20kMS });
};

addTozen('1"', { drat: 508000 });
addTozen('1 1/4"', { drat: 545000, jis10k: 447000, pn16k: 596000, jis16kMS: 838000, jis20kMS: 862000 });
addTozen('1 1/2"', { drat: 676000, jis10k: 471000, pn16k: 600000, jis16kMS: 854000, jis20kMS: 878000 });
addTozen('2"', { drat: 831000, jis10k: 572000, pn16k: 728000, jis16kMS: 891000, jis20kMS: 932000 });
addTozen('2 1/2"', { jis10k: 666000, pn16k: 817000, jis16kMS: 1102000, jis20kMS: 1171000 });
addTozen('3"', { jis10k: 759000, pn16k: 945000, jis16kMS: 1341000, jis20kMS: 1533000 });
addTozen('4"', { jis10k: 1062000, pn16k: 1338000, jis16kMS: 2025000, jis20kMS: 2091000 });
addTozen('5"', { jis10k: 1432000, pn16k: 1756000, jis16kMS: 2564000, jis20kMS: 2938000 });
addTozen('6"', { jis10k: 1885000, pn16k: 2216000, jis16kMS: 3251000, jis20kMS: 3668000 });
addTozen('8"', { jis10k: 3159000, pn16k: 3755000, jis16kMS: 5223000 });
addTozen('10"', { jis10k: 4775000, pn16k: 5514000, jis16kMS: 7504000 });
addTozen('12"', { jis10k: 6111000, pn16k: 6514000, jis16kMS: 9184000 });
addTozen('14"', { jis10k: 11625000, pn16k: 12834000, jis16kMS: 14344000 });

// TEE SCH 40
const teeSch40 = {
  '3/4" X 1/2"': 16900,
  '1" X 3/4"': 26150, '1" X 1/2"': 26150,
  '1 1/4" X 3/4"': 34650, '1 1/4" X 1/2"': 34650, '1 1/4" X 1"': 34150,
  '1 1/2" X 1 1/2"': 43800, '1 1/2" X 3/4"': 43800, '1 1/2" X 1"': 43800, '1 1/2" X 1 1/4"': 43800,
  '2" X 1/2"': 56200, '2" X 3/4"': 56800, '2" X 1"': 56800, '2" X 1 1/4"': 56800, '2" X 1 1/2"': 56800,
  '2 1/2" X 1"': 106200, '2 1/2" X 1 1/4"': 106200, '2 1/2" X 1 1/2"': 106200, '2 1/2" X 2"': 106200,
  '3" X 1"': 133200, '3" X 1 1/4"': 133200, '3" X 1 1/2"': 133200, '3" X 2"': 133200, '3" X 2 1/2"': 133200,
  '4" X 1"': 204000, '4" X 1 1/4"': 204000, '4" X 1 1/2"': 204000, '4" X 2"': 204000, '4" X 2 1/2"': 204000, '4" X 3"': 204000,
  '5" X 1 1/2"': 337200, '5" X 2"': 337200, '5" X 2 1/2"': 337200, '5" X 3"': 337200, '5" X 4"': 337200,
  '6" X 1 1/2"': 493500, '6" X 2"': 502000, '6" X 2 1/2"': 502000, '6" X 3"': 502000, '6" X 4"': 502000, '6" X 5"': 502000,
  '8" X 2"': 940100, '8" X 2 1/2"': 940100, '8" X 3"': 940100, '8" X 4"': 940100, '8" X 5"': 940100, '8" X 6"': 940100,
  '10" X 3"': 1571500, '10" X 4"': 1571500, '10" X 5"': 1571500, '10" X 6"': 1571500, '10" X 8"': 1571500,
  '12" X 4"': 2507100, '12" X 5"': 2507100, '12" X 6"': 2507100, '12" X 8"': 2507100, '12" X 10"': 2507100,
  '14" X 4"': 3149300, '14" X 5"': 3149300, '14" X 6"': 3149300, '14" X 8"': 3149300, '14" X 10"': 3149300, '14" X 12"': 3149300,
  '16" X 6"': 4876400, '16" X 8"': 4876400, '16" X 10"': 4876400, '16" X 12"': 4876400, '16" X 14"': 4876400
};

for (const [size, price] of Object.entries(teeSch40)) {
  items.push({ name: 'TEE SCH 40', category: 'Pipe Fitting', unit: 'Pcs', specification: size, price });
}

// Price List Gate Valve Bronze 125# Screw (Fig.FH)
const gateValves = {
  '1/2"': 296182.5, '3/4"': 369092.5, '1"': 511980, '1 1/4"': 751582.5,
  '1 1/2"': 931672.5, '2"': 1407887.5, '2 1/2"': 2601200, '3"': 3548500, '4"': 9104000
};

for (const [size, price] of Object.entries(gateValves)) {
  items.push({ name: 'Gate Valve Bronze 125# Screw (Fig.FH)', category: 'Valve', unit: 'Pcs', specification: size, price });
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
