const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkAllAccess() {
  console.log("--- All User-Project Access Entries ---");
  const access = await prisma.user_project_access.findMany({
    include: { 
      users: { select: { id: true, name: true, email: true } },
      projects: { select: { id: true, name: true } }
    }
  });
  
  access.forEach(a => {
    console.log(`User: ${a.users.name} (${a.users.email}) -> Project: ${a.projects.name} (ID: ${a.projects.id})`);
  });

  if (access.length === 0) console.log("No explicit project access records found.");

  await prisma.$disconnect();
}

checkAllAccess().catch(console.error);
