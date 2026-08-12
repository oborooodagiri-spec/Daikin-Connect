const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function check() {
  const users = await prisma.users.findMany({
    select: { id: true, name: true, user_roles: { select: { roles: { select: { role_name: true } } } } }
  });
  const setyo = users.filter(u => u.name.toLowerCase().includes('setyo'));
  setyo.forEach(u => {
    const roles = u.user_roles.map(ur => ur.roles?.role_name);
    console.log(`ID: ${u.id}, Name: "${u.name}", Roles: [${roles.join(', ')}]`);
  });
  await prisma.$disconnect();
}
check();
