const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  // Simulate exact same query as getResources for admin
  const resources = await prisma.$queryRawUnsafe(`
    SELECT kr.*, p.name as project_name 
    FROM knowledge_resources kr
    LEFT JOIN projects p ON kr.project_id = p.id
    WHERE kr.type != 'VIDEO'
    ORDER BY kr.created_at DESC
  `);
  
  console.log("Total resources:", resources.length);
  
  // Find presentation ones
  const presentations = resources.filter(r => r.category === 'Presentation' || r.type === 'PPTX');
  console.log("\nPresentation resources:", presentations.length);
  presentations.forEach(p => {
    console.log("  - id:", p.id);
    console.log("    title:", p.title);
    console.log("    category:", JSON.stringify(p.category));
    console.log("    type:", JSON.stringify(p.type));
    console.log("    visibility:", p.visibility);
    console.log("    file_url:", p.file_url);
  });
  
  // Also check ALL categories
  const categories = [...new Set(resources.map(r => r.category))];
  console.log("\nAll categories:", categories);
}
main().catch(console.error).finally(() => prisma.$disconnect());
