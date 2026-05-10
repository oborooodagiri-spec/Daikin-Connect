const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const token = 'cfdba09e3ac63c7090dd9ff1229b15d2';
  const unit = await prisma.units.findUnique({
    where: { qr_code_token: token }
  });
  console.log('Unit with token:', unit);
  process.exit(0);
}

check();
