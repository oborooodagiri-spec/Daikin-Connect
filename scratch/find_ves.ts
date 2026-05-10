import { prisma } from "./src/lib/prisma";

async function findProject() {
  const projects = await prisma.projects.findMany({
    where: { name: { contains: "VES" } }
  });
  console.log(JSON.stringify(projects, (key, value) => typeof value === 'bigint' ? value.toString() : value));
}

findProject();
