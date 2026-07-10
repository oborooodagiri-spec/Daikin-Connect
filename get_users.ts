import { PrismaClient } from './src/generated/client_v3/index.js';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.users.findMany({ select: { id: true, email: true, name: true } });
  console.log(users);
}
main().finally(() => prisma.$disconnect());
