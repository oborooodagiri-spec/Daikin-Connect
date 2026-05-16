const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function grantAccess() {
  const PROJECT_ID = 5n;
  const emails = [
    'oborooodagiri@gmail.com',
    'ddyusufiskandar@gmail.com',
    'yahya@daikinapplied.co.id'
  ];

  console.log("🚀 Granting access to Project 5 for key users...");

  for (const email of emails) {
    const user = await prisma.users.findUnique({ where: { email } });
    if (user) {
      // Check if access already exists
      const existing = await prisma.user_project_access.findUnique({
        where: {
          user_id_project_id: {
            user_id: user.id,
            project_id: PROJECT_ID
          }
        }
      });

      if (!existing) {
        await prisma.user_project_access.create({
          data: {
            user_id: user.id,
            project_id: PROJECT_ID
          }
        });
        console.log(`✅ Granted access to ${user.name} (${email})`);
      } else {
        console.log(`ℹ️ ${user.name} already has access.`);
      }
    }
  }

  await prisma.$disconnect();
}

grantAccess().catch(console.error);
