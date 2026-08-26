const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const allDeals = await prisma.pipeline_deals.findMany({
    orderBy: { quotation: 'desc' }
  });
  const fy25Deals = [];
  for (const d of allDeals) {
    if (d.status !== 'A' && d.is_closed !== true) continue;
    const rawDate = d.target_po_date || d.est_booking_month;
    if (rawDate) {
      const dt = new Date(rawDate);
      if (!isNaN(dt.getTime())) {
        const m = dt.getMonth() + 1;
        const y = dt.getFullYear();
        const fy = m >= 4 ? y - 2000 : y - 1 - 2000;
        if (fy === 25) fy25Deals.push(d);
      }
    }
  }
  let totalValue = 0;
  fy25Deals.forEach((d, i) => {
    const val = Number(d.quotation) || 0;
    totalValue += val;
    console.log((i+1) + '. [' + d.status + '] ' + d.client_name + ' - ' + (d.project_name || '-') + ' | PIC: ' + d.pic + ' | Rp ' + val.toLocaleString('id-ID'));
  });
  console.log('\nTotal Value FY25 Closed: Rp ' + totalValue.toLocaleString('id-ID'));
}
main().finally(() => prisma.$disconnect());
