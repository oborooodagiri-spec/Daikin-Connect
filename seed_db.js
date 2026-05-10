const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Starting seed...");
    
    // Insert VES Flow
    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_resources (id, title, category, type, thumbnail, href, size, tags, visibility, created_at, updated_at)
      VALUES (
        'ves-flow-app', 
        'VES Project Flow (Interactive Tool)', 
        'Interactive App', 
        'APP', 
        '/images/ves-flow-isometric.png', 
        '/admin/ves-flow', 
        'LIVE', 
        'VES, Flow, Strategic', 
        'Public',
        NOW(),
        NOW()
      )
    `);
    
    // Insert Ops Schedule
    await prisma.$executeRawUnsafe(`
      INSERT INTO knowledge_resources (id, title, category, type, thumbnail, href, size, tags, visibility, created_at, updated_at)
      VALUES (
        'ops-schedule', 
        'Operational Daily Schedule', 
        'Interactive App', 
        'SPREADSHEET', 
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=300', 
        '/admin/schedule', 
        'LIVE', 
        'Operational, Excel, Schedule', 
        'Public',
        NOW(),
        NOW()
      )
    `);

    console.log("SEED_SUCCESS");
  } catch (e) {
    console.error("SEED_ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
