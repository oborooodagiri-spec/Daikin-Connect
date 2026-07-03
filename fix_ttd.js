const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function fix() {
  try {
    const res = await prisma.$executeRawUnsafe('UPDATE service_activities SET reviewer_signature = engineer_signature, engineer_signature = NULL WHERE engineer_signature IS NOT NULL AND reviewer_signature IS NULL');
    console.log('\n✅ BERHASIL! ' + res + ' tanda tangan telah dipindahkan dari kolom Teknisi ke kolom Engineer Internal.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
fix();
