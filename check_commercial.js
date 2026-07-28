const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkCommercial() {
  const allDeals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const COMMERCIAL_SECTORS = ["Komersial", "Government", "Hospital"];
  const commercialDeals = allDeals.filter(d => COMMERCIAL_SECTORS.includes(d.sector || ''));

  // Logic from SectorPipelineModal
  let fy25Total = 0;
  let fy26Total = 0;
  let totalExcludedH = 0;
  let totalH = 0;

  commercialDeals.forEach(d => {
    const val = Number(d.quotation) || 0;
    
    if (d.status === 'H') {
      totalH += val;
      return; // SectorPipelineModal excludes H
    }

    const rawDate = d.target_po_date || d.est_booking_month;
    if (!rawDate) return;
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return;

    // Check FY25 (Apr 2025 - Mar 2026)
    const fy25Start = new Date(2025, 3, 1);
    const fy26Start = new Date(2026, 3, 1);
    const fy27Start = new Date(2027, 3, 1);

    if (dt >= fy25Start && dt < fy26Start) fy25Total += val;
    if (dt >= fy26Start && dt < fy27Start) fy26Total += val;
    
    totalExcludedH += val;
  });

  console.log(`Total Commercial (excluding H, mapped to any FY date): ${totalExcludedH}`);
  console.log(`FY25 Total: ${fy25Total}`);
  console.log(`FY26 Total: ${fy26Total}`);
  console.log(`Total H (Hold): ${totalH}`);
}

checkCommercial().catch(console.error).finally(() => prisma.$disconnect());
