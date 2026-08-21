const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE knowledge_resources 
    SET visibility = 'Public' 
    WHERE category = 'Presentation' AND title = 'presentasi'
  `);
  console.log("Updated rows:", updated);
}
main().finally(() => prisma.$disconnect());
