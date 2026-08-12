const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function test() {
  try {
    const existing = await prisma.pipeline_deals.findFirst();
    if (!existing) {
      console.log('No existing deal');
      return;
    }
    const closedAmount = 1000;
    const closedDeal = await prisma.pipeline_deals.create({
      data: {
        client_name: existing.client_name,
        area: existing.area,
        project_name: existing.project_name,
        bill_material: existing.bill_material,
        type: existing.type,
        region: existing.region,
        sales_planner: existing.sales_planner,
        pic: existing.pic,
        pic_id: existing.pic_id,
        category: existing.category,
        sector: existing.sector,
        quotation: closedAmount,
        status: existing.status,
        est_booking_month: existing.est_booking_month,
        booking_fc: existing.booking_fc,
        remarks: existing.remarks,
        source: existing.source,
        priority: existing.priority,
        latitude: existing.latitude,
        longitude: existing.longitude,
        target_po_date: existing.target_po_date,
        is_closed: true,
        is_partial_close: true,
        partial_percentage: 10.0,
        parent_deal_id: existing.id
      }
    });
    console.log('Success:', closedDeal.id);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
