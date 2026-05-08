"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { revalidatePath } from "next/cache";

export async function submitCorrectiveMaintenanceForm(data: any) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    // We store the structured JSON data in 'finding' or 'issue_description' to avoid breaking schema types
    const technicalJson = JSON.stringify(data.technicalData);

    const record = await prisma.corrective_maintenances.create({
      data: {
        unit_id: data.unit_id,
        tech_name: data.technician_name,
        inspector_name: session.user?.name || "Admin",
        repair_date: new Date(data.service_date),
        issue_description: data.problem_reported,
        finding: technicalJson, // Store shopping list, parameters, photos here
        report_pdf: data.pdf_url || null
      }
    });

    return serializePrisma({ success: true, data: record });
  } catch (error: any) {
    console.error("Submit corrective maintenance error:", error);
    return { error: error.message || "Failed to submit corrective maintenance" };
  }
}
