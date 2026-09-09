
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const fyStart = new Date(2026, 3, 1).getTime();
  const fyEnd = new Date(2027, 2, 31, 23, 59, 59, 999).getTime();

  const closed = await prisma.pipeline_deals.findMany({
    where: { is_closed: true }
  });
  console.log("Total closed:", closed.length);
  
  let inFy26 = 0;
  closed.forEach(d => {
     let dateStr = d.closed_period;
     // The modal uses d.updated_at if closed_period is missing!
     // Wait, let us check what TargetProgressModal does.
     let time = d.updated_at.getTime();
     if (time >= fyStart && time <= fyEnd) inFy26++;
  });
  console.log("Closed in FY26:", inFy26);
  
  if (closed.length > 0) {
    console.log("Sample closed project:");
    console.log(closed[0].project_name, closed[0].quotation, closed[0].updated_at);
  }
}
main().finally(() => prisma.$disconnect());

