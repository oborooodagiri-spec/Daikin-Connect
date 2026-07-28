const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkE() {
  const deals = await prisma.pipeline_deals.findMany({
    where: { status: 'E' }
  });

  const simpleDeals = deals.map(d => ({
    id: d.id,
    name: d.project_name,
    quotation: Number(d.quotation) || 0,
    po: d.target_po_date,
    created: d.created_at
  }));

  // Find subset sum algorithm for 462,200,000
  const target = 462200000;
  
  // just loop through combinations of 1 or 2 items for now
  for (let i = 0; i < simpleDeals.length; i++) {
    if (simpleDeals[i].quotation === target) {
      console.log("Found 1 deal:", simpleDeals[i]);
      return;
    }
    for (let j = i + 1; j < simpleDeals.length; j++) {
      if (simpleDeals[i].quotation + simpleDeals[j].quotation === target) {
        console.log("Found 2 deals:", simpleDeals[i], simpleDeals[j]);
        return;
      }
      for (let k = j + 1; k < simpleDeals.length; k++) {
        if (simpleDeals[i].quotation + simpleDeals[j].quotation + simpleDeals[k].quotation === target) {
          console.log("Found 3 deals:", simpleDeals[i], simpleDeals[j], simpleDeals[k]);
          return;
        }
      }
    }
  }
  console.log("No combination of 1, 2, or 3 deals found for 462,200,000.");
}

checkE().catch(console.error).finally(() => prisma.$disconnect());
