const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function run() {
  const resourceId = 'roesmin-logsheet-resource';
  try {
    // Delete if it already exists to ensure clean idempotent insert
    await prisma.knowledge_resources.deleteMany({
      where: {
        OR: [
          { id: resourceId },
          { title: 'Logsheet Lanud Roesmin Nurjadin' }
        ]
      }
    });

    console.log("Creating new knowledge resource record for Lanud Roesmin Nurjadin...");
    
    await prisma.knowledge_resources.create({
      data: {
        id: resourceId,
        title: "Logsheet Lanud Roesmin Nurjadin",
        category: "Logsheet",
        type: "SPREADSHEET",
        file_url: null,
        href: "https://docs.google.com/spreadsheets/d/1Gjj68KTSnTKErBaMfMaJmDc5cv1F4y1Y/edit?usp=sharing&ouid=101151975877810511454&rtpof=true&sd=true",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300",
        size: "LIVE",
        tags: "Logsheet, Lanud, Rafale, Monitoring, Chiller, AHU, CRAC, FCU",
        visibility: "Internal",
        allowed_users: null,
        project_id: BigInt(4) // Linked to LANUD ROESMIN NURJADIN project
      }
    });

    console.log("SUCCESS: Logsheet resource card has been seeded in the knowledge_resources table!");

    // Verify it was written correctly
    const inserted = await prisma.knowledge_resources.findUnique({
      where: { id: resourceId }
    });
    console.log("\nSeeded Resource Details:");
    console.log("ID:", inserted.id);
    console.log("Title:", inserted.title);
    console.log("Category:", inserted.category);
    console.log("Type:", inserted.type);
    console.log("Href:", inserted.href);
    console.log("Project ID:", inserted.project_id);

  } catch (err) {
    console.error("Database seed error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
