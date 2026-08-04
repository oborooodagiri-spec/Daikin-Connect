const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.users.findMany({
  where: { name: 'Cindy Gamas' },
  select: { name: true, user_roles: { select: { roles: { select: { role_name: true } } } } }
}).then(r => console.dir(r, {depth:null})).finally(() => prisma.$disconnect());
