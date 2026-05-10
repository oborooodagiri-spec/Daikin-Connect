const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Try to count issues
    const count = await prisma.project_issues.count();
    console.log(`Found ${count} project issues`);
    
    // Try to fetch projects with issues
    const projects = await prisma.projects.findMany({
      include: { project_issues: true }
    });
    console.log(`Fetched ${projects.length} projects with issue counts`);
  } catch (err) {
    console.error('DATABASE ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
