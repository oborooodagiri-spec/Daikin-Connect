import { PrismaClient } from "@/generated/client_v3";
import CommercialHistoryClient from "./CommercialHistoryClient";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function CommercialHistoryPage() {
  const projects = await prisma.projects.findMany({
    orderBy: { name: 'asc' },
    include: {
      customers: true,
      work_orders: {
        orderBy: { created_at: 'desc' },
        include: {
          quotations: {
            include: {
              sla: true
            }
          }
        }
      }
    }
  });

  // Convert BigInt to string so it can be passed to the Client Component
  const serializedProjects = JSON.parse(JSON.stringify(projects, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

  return <CommercialHistoryClient projects={serializedProjects} />;
}
