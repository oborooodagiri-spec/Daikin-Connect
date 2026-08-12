const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      where: { name: { contains: 'setyo' } }
    });
    console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email, is_active: u.is_active })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
checkUsers();
