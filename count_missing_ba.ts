
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.service_activities.count({
      where: {
        berita_acara_pdf_url: null,
        type: { in: ['Audit', 'Preventive', 'Corrective'] }
      }
    });
    console.log('Missing BA Count:', count);
    
    // Also list some IDs for testing if needed
    if (count > 0) {
        const samples = await prisma.service_activities.findMany({
            where: {
                berita_acara_pdf_url: null,
                type: { in: ['Audit', 'Preventive', 'Corrective'] }
            },
            take: 5,
            select: { id: true, type: true, inspector_name: true }
        });
        console.log('Samples:', samples);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
