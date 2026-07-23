const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ops = await prisma.pipeline_ops.findMany();
  console.log("Total ops:", ops.length);
  if (ops.length > 0) {
    console.log(ops.slice(0, 5));
  }
}
main().finally(() => prisma.$disconnect());
