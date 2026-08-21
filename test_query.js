const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const adminRes = await prisma.$queryRawUnsafe(`
        SELECT kr.*, p.name as project_name 
        FROM knowledge_resources kr
        LEFT JOIN projects p ON kr.project_id = p.id
        WHERE kr.type != 'VIDEO'
        ORDER BY kr.created_at DESC
      `);
  console.log("Admin sees:", adminRes.filter(r => r.category === 'Presentation').length, "presentations.");
}
main().finally(() => prisma.$disconnect());
