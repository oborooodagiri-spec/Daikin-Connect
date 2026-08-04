const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.roles.findMany().then(console.log).finally(() => prisma.$disconnect());
