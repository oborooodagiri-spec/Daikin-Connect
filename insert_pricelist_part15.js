const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

const addSpiral = (type, finish, thicknessAndPrices) => {
  for (const [size, { tebal, price }] of Object.entries(thicknessAndPrices)) {
    items.push({ 
      name: `Pipa Spiral ${type} SNI 0039 : 2013 - ${finish}`, 
      category: 'Pipe', 
      unit: 'Btg', 
      specification: `${size} (${tebal} mm)`, 
      price 
    });
  }
};

// 1. SPIRAL TIPIS SNI 0039 : 2013
const tipisHitam = {
  '10"': { tebal: '5,0', price: 4244400 }, '12"': { tebal: '5,0', price: 5047100 },
  '14"': { tebal: '5,6', price: 6206000 }, '16"': { tebal: '5,6', price: 7107000 },
  '18"': { tebal: '6,4', price: 9135000 }, '20"': { tebal: '6,4', price: 10165000 }, '24"': { tebal: '6,4', price: 12223400 }
};
const tipisGalvanis = {
  '10"': { tebal: '5,0', price: 5808000 }, '12"': { tebal: '5,0', price: 6906000 },
  '14"': { tebal: '5,6', price: 8491200 }, '16"': { tebal: '5,6', price: 9724000 },
  '18"': { tebal: '6,4', price: 12500000 }, '20"': { tebal: '6,4', price: 13908000 }, '24"': { tebal: '6,4', price: 16725000 }
};
addSpiral('TIPIS', 'HITAM', tipisHitam);
addSpiral('TIPIS', 'GALVANIS', tipisGalvanis);

// 2. SPIRAL MEDIUM SNI 0039 : 2013
const mediumHitam = {
  '10"': { tebal: '6,4', price: 5405000 }, '12"': { tebal: '6,4', price: 6432000 },
  '14"': { tebal: '6,4', price: 7077000 }, '16"': { tebal: '6,4', price: 8106000 },
  '18"': { tebal: '9,5', price: 13348000 }, '20"': { tebal: '9,5', price: 14862000 }, '24"': { tebal: '9,5', price: 17891000 }
};
const mediumGalvanis = {
  '10"': { tebal: '6,4', price: 7395000 }, '12"': { tebal: '6,4', price: 8801000 },
  '14"': { tebal: '6,4', price: 9683000 }, '16"': { tebal: '6,4', price: 11091000 },
  '18"': { tebal: '9,5', price: 18302000 }, '20"': { tebal: '9,5', price: 20379000 }, '24"': { tebal: '9,5', price: 24532000 }
};
addSpiral('MEDIUM', 'HITAM', mediumHitam);
addSpiral('MEDIUM', 'GALVANIS', mediumGalvanis);

// 3. SPIRAL TEBAL SNI 0039 : 2013
const tebalHitam = {
  '10"': { tebal: '9,3', price: 7723000 }, '12"': { tebal: '10,3', price: 10164000 },
  '14"': { tebal: '11,1', price: 12037000 }, '16"': { tebal: '12,7', price: 15692000 },
  '18"': { tebal: '12,7', price: 17716000 }, '20"': { tebal: '12,7', price: 19741000 }, '24"': { tebal: '12,7', price: 23790000 }
};
const tebalGalvanis = {
  '10"': { tebal: '9,3', price: 10581000 }, '12"': { tebal: '10,3', price: 13927000 },
  '14"': { tebal: '11,1', price: 16492000 }, '16"': { tebal: '12,7', price: 21516000 },
  '18"': { tebal: '12,7', price: 24292000 }, '20"': { tebal: '12,7', price: 27068000 }, '24"': { tebal: '12,7', price: 32621000 }
};
addSpiral('TEBAL', 'HITAM', tebalHitam);
addSpiral('TEBAL', 'GALVANIS', tebalGalvanis);


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
