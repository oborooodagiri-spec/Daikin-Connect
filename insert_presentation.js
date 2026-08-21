const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.knowledge_resources.create({
    data: {
      title: 'presentasi',
      category: 'Presentation',
      type: 'PPTX',
      file_url: '/uploads/Control_Device_Presentation_30July2026.pptx',
      visibility: 'Internal',
      tags: 'presentasi, control device'
    }
  });
  console.log('Inserted:', res);
}
main().catch(console.error).finally(() => prisma.$disconnect());
