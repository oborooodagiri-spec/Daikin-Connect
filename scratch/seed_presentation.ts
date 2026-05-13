import { PrismaClient } from '../src/generated/client_v3';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Blueprint V2 Presentation...');

  await prisma.knowledge_resources.create({
    data: {
      title: "VES Master Blueprint V2: Executive Presentation",
      category: "STRATEGY",
      type: "INTERACTIVE",
      tags: "VES, Strategy, Roadmap, Management, Presentation",
      href: "/admin/blueprint-presentation",
      visibility: "Internal",
      thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300"
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
