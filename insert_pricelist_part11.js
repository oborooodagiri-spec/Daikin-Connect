const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

const reducers = {
  '3/4" X 1/2"': 3000,
  '1" X 1/2"': 3000, '1" X 3/4"': 4000,
  '1 1/4" X 1/2"': 5000, '1 1/4" X 3/4"': 5000, '1 1/4" X 1"': 6000,
  '1 1/2" X 1/2"': 7000, '1 1/2" X 3/4"': 7000, '1 1/2" X 1"': 9000, '1 1/2" X 1 1/4"': 10000,
  '2" X 1/2"': 11000, '2" X 3/4"': 10000, '2" X 1"': 12000, '2" X 1 1/4"': 14000, '2" X 1 1/2"': 15000,
  '2 1/2" X 1 1/2"': 21000, '2 1/2" X 2"': 23000,
  '3" X 3/4"': 17000, '3" X 1"': 18000, '3" X 1 1/4"': 21000, '3" X 1 1/2"': 23000, '3" X 2"': 25000, '3" X 2 1/2"': 37000,
  '4" X 1 1/2"': 67000, '4" X 2"': 61000, '4" X 2 1/2"': 68000, '4" X 3"': 71000,
  '5" X 3"': 97000, '5" X 4"': 107000,
  '6" X 3"': 122000, '6" X 4"': 133000, '6" X 5"': 139000,
  '8" X 4"': 239000, '8" X 5"': 256000, '8" X 6"': 272000,
  '10" X 8"': 476000
};

for (const [size, price] of Object.entries(reducers)) {
  items.push({ name: 'REDUCER PVC CLASS AW', category: 'PVC Fitting', unit: 'Pcs', specification: size, price });
}

items.push(
  { name: 'Double Nipple PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '3/4" X 3/4"', price: 2000 },
  { name: 'Double Nipple PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '1" X 1"', price: 3000 }
);

const shockLuar = {
  '1/2" X 1/2"': 2000, '1/2" X 3/4"': 3000,
  '3/4" X 1/2"': 3000, '3/4" X 3/4"': 3000,
  '1" X 1/2"': 3000, '1" X 3/4"': 3000, '1" X 1"': 4000,
  '1 1/4" X 1 1/4"': 7000, '1 1/2" X 1 1/2"': 9000,
  '2" X 2"': 13000, '2 1/2" X 2 1/2"': 15000,
  '3" X 3"': 31000, '4" X 4"': 54000
};
for (const [size, price] of Object.entries(shockLuar)) {
  items.push({ name: 'Shock Drat Luar PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: size, price });
}

const shockDalam = {
  '1/2" X 1/2"': 3000, '1/2" X 3/4"': 3000,
  '3/4" X 3/4"': 3000,
  '1" X 1/2"': 5000, '1" X 3/4"': 4000, '1" X 1"': 5000,
  '1 1/4" X 1 1/4"': 8000, '1 1/2" X 1 1/2"': 11000,
  '2" X 2"': 13000, '2 1/2" X 2 1/2"': 14000,
  '3" X 3"': 33000, '4" X 4"': 64000
};
for (const [size, price] of Object.entries(shockDalam)) {
  items.push({ name: 'Shock Drat Dalam PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: size, price });
}

const teePVC = {
  '1/2" X 1/2"': 4000,
  '3/4" X 1/2"': 5000, '3/4" X 3/4"': 5000,
  '1" X 1/2"': 8000, '1" X 3/4"': 8000, '1" X 1"': 8000,
  '1 1/4" X 1/2"': 11000, '1 1/4" X 3/4"': 11000, '1 1/4" X 1"': 13000, '1 1/4" X 1 1/4"': 13000,
  '1 1/2" X 1/2"': 15000, '1 1/2" X 3/4"': 15000, '1 1/2" X 1"': 16000, '1 1/2" X 1 1/4"': 18000, '1 1/2" X 1 1/2"': 18000,
  '2" X 1/2"': 18000, '2" X 3/4"': 18000, '2" X 1"': 19000, '2" X 1 1/4"': 25000, '2" X 1 1/2"': 25000, '2" X 2"': 28000,
  '2 1/2" X 1 1/2"': 42000, '2 1/2" X 2"': 45000, '2 1/2" X 2 1/2"': 42000,
  '3" X 3/4"': 38000, '3" X 1"': 39000, '3" X 1 1/4"': 43000, '3" X 1 1/2"': 45000, '3" X 2"': 49000, '3" X 2 1/2"': 56000, '3" X 3"': 64000,
  '4" X 1 1/2"': 97000, '4" X 2"': 98000, '4" X 2 1/2"': 116000, '4" X 3"': 119000, '4" X 4"': 127000,
  '5" X 5"': 223000,
  '6" X 2"': 251000, '6" X 4"': 291000, '6" X 6"': 318000,
  '8" X 8"': 659000
};
for (const [size, price] of Object.entries(teePVC)) {
  items.push({ name: 'Tee PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: size, price });
}

items.push(
  { name: 'Flange PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '2"', price: 39000 },
  { name: 'Flange PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '2 1/2"', price: 51000 },
  { name: 'Flange PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '3"', price: 60000 },
  { name: 'Flange PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '4"', price: 99000 },
  { name: 'Flange PVC (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '6"', price: 226000 },

  { name: 'Water Mur / Union Thread (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '1/2"', price: 28000 },
  { name: 'Water Mur / Union Thread (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '3/4"', price: 34000 },
  { name: 'Water Mur / Union Thread (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '1"', price: 45000 },
  { name: 'Water Mur / Union Thread (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '1 1/4"', price: 76000 },
  { name: 'Water Mur / Union Thread (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: '1 1/2"', price: 104000 }
);

const pipesRucika = {
  '1/2"': { 'AW': 8000, 'VP': 14250 },
  '3/4"': { 'AW': 10750, 'VP': 17250 },
  '1"': { 'AW': 14750, 'VP': 25000 },
  '1 1/4"': { 'AW': 22000, 'VP': 33500, 'D': 13750 },
  '1 1/2"': { 'AW': 25250, 'VP': 44000, 'D': 15750, 'VU': 23000 },
  '2"': { 'AW': 32250, 'VP': 62000, 'D': 20000, 'VU': 29000 },
  '2 1/2"': { 'AW': 47000, 'VP': 79750, 'D': 27000, 'VU': 45750 },
  '3"': { 'AW': 66250, 'VP': 126750, 'D': 35750, 'VU': 66750 },
  '4"': { 'AW': 109500, 'VP': 196000, 'D': 56250, 'VU': 100000 },
  '5"': { 'AW': 173500, 'VP': 245250, 'D': 86750, 'VU': 150750 },
  '6"': { 'AW': 243250, 'VP': 277250, 'D': 114250, 'VU': 216500 },
  '8"': { 'AW': 408000, 'VP': 557000, 'D': 200750, 'VU': 216500 },
  '10"': { 'AW': 630250, 'VP': 848500, 'D': 330750, 'VU': 534750 },
  '12"': { 'AW': 889500, 'VP': 1203500, 'D': 464000, 'VU': 751000 }
};

for (const [size, types] of Object.entries(pipesRucika)) {
  for (const [type, price] of Object.entries(types)) {
    items.push({
      name: `Pipe PVC Rucika Class ${type}`,
      category: 'PVC Pipe',
      unit: 'Meter', // Wait, the image says 'Unit Price' but PVC pipe is often sold per batang or meter. Let's assume Meter based on previous pipe sizes or maybe Pcs. I'll put Meter.
      specification: size,
      price: price
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
