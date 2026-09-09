
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const deals = await prisma.pipeline_deals.findMany({ where: { status: "A" } });
  let invalidCount = 0;
  let invalidTotal = 0;
  deals.forEach(d => {
    const rawDate = d.target_po_date || d.est_booking_month || d.created_at;
    const dt = rawDate ? new Date(rawDate) : null;
    if (!dt || isNaN(dt.getTime())) {
      invalidCount++;
      invalidTotal += Number(d.quotation || 0);
      console.log("Invalid deal:", d.id, rawDate, d.quotation);
    }
  });
  console.log("Total invalid:", invalidCount, "Value:", invalidTotal);
}
main().finally(() => prisma.$disconnect());

