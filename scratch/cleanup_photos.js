const { PrismaClient } = require('../src/generated/client_v2');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  // Delete only the bulk-synced photo records
  const r = await prisma.activity_photos.deleteMany({
    where: { photo_url: { startsWith: 'audit_' } }
  });
  console.log('Deleted', r.count, 'bulk-synced photo records');

  // Also clean up the files
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audit');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => f.startsWith('audit_'));
    files.forEach(f => fs.unlinkSync(path.join(uploadDir, f)));
    console.log('Deleted', files.length, 'photo files from disk');
  }

  await prisma.$disconnect();
}
main();
