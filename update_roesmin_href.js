const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function run() {
  const resourceId = 'roesmin-logsheet-resource';
  try {
    // Update the href to point to our new internal interactive page
    await prisma.knowledge_resources.update({
      where: { id: resourceId },
      data: {
        href: "/admin/database/logsheet-roesmin",
        type: "DATABASE",
        category: "Logsheet",
        size: "LIVE"
      }
    });

    console.log("SUCCESS: Updated resource href to /admin/database/logsheet-roesmin");
    
    const updated = await prisma.knowledge_resources.findUnique({
      where: { id: resourceId }
    });
    console.log("Updated Record:");
    console.log("Title:", updated.title);
    console.log("Href:", updated.href);
    console.log("Type:", updated.type);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
