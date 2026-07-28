const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkPivotCounts() {
  const allDeals = await prisma.pipeline_deals.findMany();
  
  const pivotStatuses = ['A', 'B', 'C', 'D', 'E'];
  const pivotDeals = allDeals.filter(d => 
    !d.is_closed && 
    !['L', 'H'].includes(d.status) && 
    pivotStatuses.includes(d.status)
  );

  console.log("Total Deals in Pivot Table Matrix (A,B,C,D,E, unclosed):", pivotDeals.length);

  const nonPivotDeals = allDeals.filter(d => 
    !(!d.is_closed && !['L', 'H'].includes(d.status) && pivotStatuses.includes(d.status))
  );

  console.log("Deals NOT in Pivot Table:");
  const statusCounts = {};
  nonPivotDeals.forEach(d => {
    let s = d.status || 'blank';
    if (d.is_closed) s += ' (closed)';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  console.log(statusCounts);
}

checkPivotCounts().catch(console.error).finally(() => prisma.$disconnect());
