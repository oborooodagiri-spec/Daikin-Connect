const { PrismaClient } = require('../src/generated/client_v3/index.js');
const prisma = new PrismaClient();

async function main() {
  const kr = await prisma.knowledge_resources.findMany();
  console.log("KNOWLEDGE RESOURCES COUNT:", kr.length);
  
  const serialized = kr.map(item => {
    const copy = { ...item };
    for (const key in copy) {
      if (typeof copy[key] === 'bigint') {
        copy[key] = copy[key].toString();
      }
    }
    return copy;
  });
  
  console.log(JSON.stringify(serialized, null, 2));
  await prisma.$disconnect();
}

main();
