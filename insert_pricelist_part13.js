const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// 1. Fitting Drat Glav
const addGlav = (name, prices) => {
  for (const [size, price] of Object.entries(prices)) {
    items.push({ name: `Fitting Drat Glav - ${name}`, category: 'Pipe Fitting', unit: 'Pcs', specification: size, price });
  }
};

addGlav('Elbow 90', { '3/8"': 13600, '1/4"': 13600, '1/2"': 10500, '3/4"': 15050, '1"': 26050, '1 1/4"': 34700, '1 1/2"': 46250, '2"': 69350 });
addGlav('Elbow 45', { '1/2"': 10500, '3/4"': 15660, '1"': 24550, '1 1/4"': 39960, '1 1/2"': 49050, '2"': 73660 });
addGlav('Tee', { '3/4"': 19120, '1"': 34150, '1 1/4"': 45050, '1 1/2"': 57780, '2"': 100120 });
addGlav('Shock Drat', { '3/8"': 9850, '1/4"': 9850, '1/2"': 8100, '3/4"': 11150, '1"': 18580, '1 1/4"': 26050, '1 1/2"': 31900, '2"': 49200 });
addGlav('D-Nipple', { '3/8"': 10150, '1/4"': 10150, '1/2"': 8750, '3/4"': 11800, '1"': 16200, '1 1/4"': 23800, '1 1/2"': 33050, '2"': 45150 });
addGlav('Water Mur', { '3/8"': 40750, '1/4"': 40750, '1/2"': 32950, '3/4"': 40600, '1"': 49200, '1 1/4"': 73700, '1 1/2"': 92700, '2"': 133100 });
addGlav('Shock Weld', { '1/2"': 20950, '3/4"': 28300, '1"': 41900, '1 1/4"': 67750, '1 1/2"': 92150, '2"': 141300 });
addGlav('Plug', { '3/8"': 8000, '1/4"': 8000, '1/2"': 7100, '3/4"': 8750, '1"': 11700, '1 1/4"': 18500, '1 1/2"': 20300, '2"': 29050 });

// 2. Pipa Galv Medium (Spindo)
const pipaGalv = {
  '1/2"': 41000, '1"': 79000, '1 1/4"': 104000, '1 1/2"': 119000,
  '2"': 162000, '2 1/2"': 207000, '3"': 268000, '4"': 388000, '5"': 522000, '6"': 622000, '8"': 1102000
};
for (const [size, price] of Object.entries(pipaGalv)) {
  items.push({ name: 'Pipa Galv Medium (Spindo)', category: 'Pipe', unit: 'Meter', specification: size, price });
}

// 3. Fitting Screw Black Steel & Galvanized "TSP" (Banded)
const addTsp = (name, prices) => {
  for (const [size, price] of Object.entries(prices)) {
    items.push({ name: `Fitting Screw Black Steel & Galvanized "TSP" - ${name}`, category: 'Pipe Fitting', unit: 'Pcs', specification: size, price });
  }
};

addTsp('KNIE/ELBOW 90', { '1/2"': 17500, '3/4"': 25300, '1"': 43700, '1 1/4"': 58300, '1 1/2"': 77600, '2"': 116500 });
addTsp('SOCKET', { '1/2"': 13650, '3/4"': 18500, '1"': 31100, '1 1/4"': 43700, '1 1/2"': 53300, '2"': 82500 });
addTsp('EQUAL TEE', { '1/2"': 22400, '3/4"': 32000, '1"': 57200, '1 1/4"': 75700, '1 1/2"': 97000, '2"': 167800 });
addTsp('W.MOER/UNION', { '1/2"': 55400, '3/4"': 68000, '1"': 82500, '1 1/4"': 116500, '1 1/2"': 155200, '2"': 233100 });
addTsp('PLUG', { '1/2"': 11700, '3/4"': 15600, '1"': 19400, '1 1/4"': 29200, '1 1/2"': 34000, '2"': 48500 });
addTsp('DOP/CAP', { '1/2"': 13650, '3/4"': 16500, '1"': 23300, '1 1/4"': 34000, '1 1/2"': 44600, '2"': 62200 });
addTsp('V.SOCK/REDUCE', { '1/2"': 16500, '3/4"': 23300, '1"': 31100, '1 1/4"': 45700, '1 1/2"': 54400, '2"': 82500 });
addTsp('V.TEE/RED.TEE', { '1/2"': 33100, '3/4"': 39800, '1"': 61100, '1 1/4"': 92200, '1 1/2"': 116500, '2"': 165000 });
addTsp('V.RING/BUSHING', { '1/2"': 14600, '3/4"': 16500, '1"': 24300, '1 1/4"': 38900, '1 1/2"': 45700, '2"': 63100 });

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
