const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.users.findFirst({
        include: {
            roles: true,
            user_roles: { include: { roles: true } }
        }
    });
    console.log('User:', user.name);
    console.log('Direct Role:', user.roles?.role_name);
    console.log('Junction Roles:', user.user_roles.map(ur => ur.roles.role_name));
  } catch (err) {
    console.error('Error fetching user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
