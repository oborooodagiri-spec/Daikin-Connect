import { PrismaClient } from './src/generated/client_v3';
const prisma = new PrismaClient();

async function main() {
  const deals = await prisma.pipeline_deals.findMany({
    where: { target_po_date: { not: null } },
    take: 5,
    select: {
      id: true,
      sector: true,
      status: true,
      target_po_date: true,
      est_booking_month: true
    }
  });
  console.log("Deals with target_po_date:");
  console.log(deals);

  const deals2 = await prisma.pipeline_deals.findMany({
    where: { est_booking_month: { not: null } },
    take: 5,
    select: {
      id: true,
      sector: true,
      status: true,
      target_po_date: true,
      est_booking_month: true
    }
  });
  console.log("\nDeals with est_booking_month:");
  console.log(deals2);
}

main().catch(console.error).finally(() => prisma.$disconnect());
