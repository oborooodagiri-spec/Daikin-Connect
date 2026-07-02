import { PrismaClient } from './src/generated/client_v3/index.js';
const prisma = new PrismaClient();
async function main() {
  const data = await prisma.pipeline_ops.findFirst({where: {customer: {contains: 'Artos'}}});
  console.log("ARTOS DATA:", data);
  const allOps = await prisma.pipeline_ops.count();
  console.log("TOTAL OPS:", allOps);
}
main();
