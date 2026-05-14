const path = require('path');
const fs = require('fs');

// Try to find the prisma client
const possiblePaths = [
  './src/generated/client_v3/index.js',
  '../src/generated/client_v3/index.js',
  'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/src/generated/client_v3/index.js'
];

let PrismaClient;
for (const p of possiblePaths) {
  try {
    const fullPath = path.resolve(p);
    if (fs.existsSync(fullPath)) {
      const module = require(fullPath);
      PrismaClient = module.PrismaClient;
      console.log('Found Prisma at:', fullPath);
      break;
    }
  } catch (e) {}
}

if (!PrismaClient) {
  console.error('PrismaClient not found in any path');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const unit = await prisma.units.findFirst({
    where: { tag_number: 'DKN002078' },
    include: {
      service_activities: {
        where: { type: 'Preventive' },
        orderBy: { service_date: 'desc' },
        take: 1
      }
    }
  });
  console.log('DATA_START');
  console.log(JSON.stringify(unit, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
  console.log('DATA_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
