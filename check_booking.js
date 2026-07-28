const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkBooking() {
  const deals = await prisma.pipeline_deals.findMany({
    where: {
      is_closed: false,
      status: { not: 'L' }
    }
  });

  const okDeals = deals.filter(d => d.booking_fc && d.booking_fc.toUpperCase() === 'OK');
  
  const total = okDeals.reduce((sum, d) => sum + (Number(d.quotation) || 0), 0);
  
  console.log(`Total Booking Forecast Deals: ${okDeals.length}`);
  console.log(`Total Booking Forecast Amount: Rp ${total.toLocaleString('id-ID')}`);
}

checkBooking().catch(console.error).finally(() => prisma.$disconnect());
