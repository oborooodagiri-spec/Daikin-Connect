import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import LogsheetRoesminClient from "./LogsheetRoesminClient";

export const metadata = {
  title: "Logsheet Lanud Roesmin Nurjadin | Daikin Connect",
  description: "Daily Logsheet monitoring HVAC — Lanud Roesmin Nurjadin (Rafale Simulator)",
};

import { prisma } from "@/lib/prisma";

export default async function LogsheetRoesminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  // Find the database entry for this logsheet to determine which project it's linked to
  const dbEntry = await prisma.knowledge_resources.findFirst({
    where: {
      href: {
        contains: "/admin/database/logsheet-roesmin"
      }
    }
  });

  const projectId = dbEntry?.project_id ? String(dbEntry.project_id) : undefined;

  return <LogsheetRoesminClient projectId={projectId} />;
}
