const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        name: true,
        code: true
      }
    });
    console.log("PROJECTS:");
    projects.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Code: ${p.code}`);
    });

    const templates = await prisma.logsheet_templates.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        project_id: true
      }
    });
    console.log("\nTEMPLATES:");
    templates.forEach(t => {
      console.log(`ID: ${t.id}, Name: ${t.name}, Type: ${t.type}, Project ID: ${t.project_id}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
