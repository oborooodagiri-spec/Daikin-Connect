import { PrismaClient } from './src/generated/client_v3/index.js';
const prisma = new PrismaClient();
async function main() {
  const deals = await prisma.pipeline_deals.findMany({
    select: {
      id: true,
      client_name: true,
      status: true,
      target_po_date: true,
      est_booking_month: true,
      created_at: true,
      is_closed: true
    },
    take: 10
  });
  console.log(JSON.stringify(deals, null, 2));
}
main().finally(() => prisma.$disconnect());
