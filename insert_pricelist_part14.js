const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [];

// 1. Honeywell Valves & Controllers
const addHoneywell = (name, prices) => {
  for (const [spec, price] of Object.entries(prices)) {
    items.push({ name, category: 'Valve', unit: 'Pcs', specification: spec, price });
  }
};

addHoneywell('Pressure Transmitter (HONEYWELL)', { 'P7620C0062B': 12303576, 'P7620C0160B': 10907898 });
addHoneywell('Electronic Universal Controller (HONEYWELL)', { 'T775U2016/U': 7269558 });

// Motorized Butterfly Valve ON OFF
const onOff = {
  'V4ABFW16-050-012 | 2"': 12355338, 'V4ABFW16-065-012 | 2 1/2"': 12355338, 'V4ABFW16-080-012 | 3"': 12508689, 'V4ABFW16-100-012 | 4"': 12587628, 'V4ABFW16-125-012 | 5"': 27872790, 'V4ABFW16-150-012 | 6"': 25999815, 'V4ABFW16-200-012 | 8"': 29724207, 'V4ABFW16-250-012 | 10"': 40065720, 'V4ABFW16-300-012 | 12"': 49904697, 'V4ABFW16-350-012 | 14"': 87177993, 'V4ABFW16-400-012 | 16"': 120791034, 'V4ABFW16-450-012 | 18"': 155404857, 'V4ABFW16-500-012 | 20"': 167998311, 'V4ABFW16-600-012 | 24"': 239038884,
  'V9BFW16-050': 8930631, 'V9BFW16-065': 9053022, 'V9BFW16-080': 9220599, 'V9BFW16-100': 9525630, 'V9BFW16-125': 13066122, 'V9BFW16-150': 21432507, 'V9BFW16-200': 23843886, 'V9BFW16-250': 28980456, 'V9BFW16-300': 32062776, 'V9BFW16-350': 48848274, 'V9BFW16-400': 56952309, 'V9BFW16-450': 86726097, 'V9BFW16-500': 93431757, 'V9BFW16-600': 123676275, 'V9BFW16-700': 227115057
};
addHoneywell('Motorized Butterfly Valve ON OFF (HONEYWELL)', onOff);

// Motorized Butterfly Valve Modulating
const modulating = {
  'V4ABFW16-050-112 | 2"': 32458188, 'V4ABFW16-065-112 | 2 1/2"': 31760886, 'V4ABFW16-080-112 | 3"': 32896452, 'V4ABFW16-100-112 | 4"': 33027804, 'V4ABFW16-125-112 | 5"': 50088459, 'V4ABFW16-150-112 | 6"': 43080297, 'V4ABFW16-200-112 | 8"': 55005360, 'V4ABFW16-250-112 | 10"': 66461949, 'V4ABFW16-300-112 | 12"': 69142662, 'V4ABFW16-350-112 | 14"': 104384631, 'V4ABFW16-400-112 | 16"': 141923532, 'V4ABFW16-450-112 | 18"': 177600468, 'V4ABFW16-500-112 | 20"': 185155092, 'V4ABFW16-600-112 | 24"': 261611808,
  'V9BFW16-050': 17770881, 'V9BFW16-065': 17893272, 'V9BFW16-080': 18060849, 'V9BFW16-100': 18365880, 'V9BFW16-125': 21973530, 'V9BFW16-150': 30272760, 'V9BFW16-200': 32684139, 'V9BFW16-250': 37821336, 'V9BFW16-300': 40903656, 'V9BFW16-350': 57849825, 'V9BFW16-400': 65953860, 'V9BFW16-450': 94147263, 'V9BFW16-500': 100852923, 'V9BFW16-600': 131097441, 'V9BFW16-700': 235955937
};
addHoneywell('Motorized Butterfly Valve Modulating (HONEYWELL)', modulating);

// 2. Reducing Socket AW
const reducingSocket = {
  '3/4" X 1/2"': 2700, '1" X 1/2"': 2800, '1" X 3/4"': 3600, '1 1/4" X 1/2"': 3900, '1 1/4" X 3/4"': 4600, '1 1/4" X 1"': 5300, '1 1/2" X 1/2"': 5700, '1 1/2" X 3/4"': 6000, '1 1/2" X 1"': 7300, '1 1/2" X 1 1/4"': 8200, '2" X 1/2"': 8500, '2" X 3/4"': 9100, '2" X 1"': 10000, '2" X 1 1/4"': 11600, '2" X 1 1/2"': 12400, '2 1/2" X 1 1/4"': 17900, '2 1/2" X 2"': 19400, '3" X 3/4"': 14400, '3" X 1"': 14900, '3" X 1 1/4"': 18200, '3" X 1 1/2"': 20200, '3" X 2"': 21600, '3" X 2 1/2"': 32100, '4" X 1 1/2"': 52800, '4" X 2"': 57400, '4" X 2 1/2"': 58600, '4" X 3"': 61300, '5" X 3"': 83600, '5" X 4"': 92400, '6" X 3"': 105300, '6" X 4"': 114800, '6" X 5"': 120200, '8" X 4"': 206300, '8" X 5"': 221500, '8" X 6"': 235200, '10" X 8"': 411100
};
for (const [spec, price] of Object.entries(reducingSocket)) {
  items.push({ name: 'Reducing Socket (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: spec, price });
}

// 3. TEE AW
const teeAw = {
  '1/2"': 3200, '3/4" X 1/2"': 4300, '3/4"': 4300, '1" X 1/2"': 6300, '1" X 3/4"': 6500, '1"': 6900, '1 1/4" X 1/2"': 9100, '1 1/4" X 3/4"': 4600, '1 1/4" X 1"': 5300, '1 1/4"': 11300, '1 1/2" X 1/2"': 12600, '1 1/2" X 3/4"': 12600, '1 1/2" X 1"': 13500, '1 1/2" X 1 1/4"': 15000, '1 1/2"': 15000, '2" X 1/2"': 15100, '2" X 3/4"': 15300, '2" X 1"': 15900, '2" X 1 1/4"': 21700, '2" X 1 1/2"': 21800, '2"': 23800, '2 1/2" X 1 1/2"': 36100, '2 1/2" X 2"': 36300, '2 1/2"': 38800, '3" X 3/4"': 32300, '3" X 1"': 33300, '3" X 1 1/4"': 37300, '3" X 1 1/2"': 39100, '3" X 2"': 42100, '3" X 2 1/2"': 48100, '3"': 54800, '4" X 1 1/2"': 83700, '4" X 2"': 84500, '4" X 2 1/2"': 100300, '4" X 3"': 102600, '4"': 109400, '5" X 3"': 145200, '5" X 4"': 149100, '6" X 2"': 217300, '6" X 3"': 241500, '6" X 4"': 251800, '6" X 5"': 272400, '6"': 274900, '8"': 569600
};
for (const [spec, price] of Object.entries(teeAw)) {
  items.push({ name: 'TEE (AW)', category: 'PVC Fitting', unit: 'Pcs', specification: spec, price });
}

// 4. Elbow 45 PVC AW
const elbow45Pvc = {
  '1 1/4"': 3200, '1 1/2"': 3700, '2"': 7300, '2 1/2"': 9800, '3"': 15900, '4"': 26900, '5"': 51200, '6"': 99100, '8"': 218600, '10"': 304300, '12"': 478200
};
for (const [spec, price] of Object.entries(elbow45Pvc)) {
  items.push({ name: 'Elbow 45 PVC AW', category: 'PVC Fitting', unit: 'Pcs', specification: spec, price });
}

// 5. Spindo Welded Pipes
const addSpindo = (name, prices) => {
  for (const [spec, price] of Object.entries(prices)) {
    items.push({ name, category: 'Pipe', unit: 'Meter', specification: spec, price });
  }
};

addSpindo('Spindo Welded - MEDIUM SNI - HITAM', { '1/2"': 241000, '3/4"': 310000, '1"': 464200, '1 1/4"': 612500, '1 1/2"': 704000, '2"': 960000, '2 1/2"': 1225000, '3"': 1582000, '4"': 2290000, '5"': 3083000, '6"': 3670000, '8"': 6500000 });
addSpindo('Spindo Welded - MEDIUM SNI - GALVANIZED', { '1/2"': 309000, '3/4"': 397000, '1"': 597500, '1 1/4"': 788500, '1 1/2"': 906000, '2"': 1236000, '2 1/2"': 1576000, '3"': 2036000, '4"': 2947000, '5"': 3965000, '6"': 4722000, '8"': 8355000 });
addSpindo('Spindo Welded - ASTM A53 A SCH 40 - HITAM', { '1/2"': 251200, '3/4"': 333400, '1"': 482200, '1 1/4"': 658000, '1 1/2"': 782500, '2"': 1045000, '2 1/2"': 1665000, '3"': 2172000, '4"': 3088000, '5"': 4178000, '6"': 5402000, '8"': 8245000 });
addSpindo('Spindo Welded - ASTM A53 A SCH 40 - GALVANIZED', { '1/2"': 320000, '3/4"': 425000, '1"': 617500, '1 1/4"': 843000, '1 1/2"': 1002000, '2"': 1338000, '2 1/2"': 2132000, '3"': 2780000, '4"': 3954000, '5"': 5350000, '6"': 6915000, '8"': 10597000, '10"': 11037128, '12"': 12940000, '14"': 16039115, '16"': 21877600, '18"': 25159240, '20"': 26107500 });

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
