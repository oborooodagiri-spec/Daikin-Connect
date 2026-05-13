import { PrismaClient } from '../src/generated/client_v3';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tier 2 & 3 Interactive Tools...');

  await prisma.knowledge_resources.create({
    data: {
      title: "VES Tier 2: Live Unit Health Index",
      category: "JUKNIS",
      type: "INTERACTIVE",
      tags: "VES, Tier 2, Health Index, Monitoring",
      href: "/admin/health-index",
      visibility: "Internal",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300"
    }
  });

  await prisma.knowledge_resources.create({
    data: {
      title: "VES Tier 3: ROI & Cost Saving Calculator",
      category: "JUKLAK",
      type: "INTERACTIVE",
      tags: "VES, Tier 3, ROI, Finance, Energy",
      href: "/admin/roi-calc",
      visibility: "Internal",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=300"
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
