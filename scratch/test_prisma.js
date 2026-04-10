const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking project_users...");
    const pu = await prisma.project_users.findMany().catch(e => "NOT_FOUND");
    console.log("project_users result:", pu === "NOT_FOUND" ? "Not Found" : "Exists");
    
    console.log("Checking user_project_access...");
    const upa = await prisma.user_project_access.findMany().catch(e => "NOT_FOUND");
    console.log("user_project_access result:", upa === "NOT_FOUND" ? "Not Found" : "Exists");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
