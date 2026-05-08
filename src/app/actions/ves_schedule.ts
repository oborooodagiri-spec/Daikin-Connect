"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Save the entire Shift Roster for a project/month
 * We use logsheet_templates as a flexible JSON store since project_intelligence is not available
 */
export async function saveVesSchedule(projectId: string, year: number, month: number, schedule: any, people: any, shiftInfo?: any) {
  try {
    const templateName = `ROSTER_${year}_${month + 1}`;
    const pId = BigInt(projectId);

    const payload = JSON.stringify({
      schedule,
      people,
      shiftInfo,
      updatedAt: new Date().toISOString()
    });

    // We use a "Logsheet Template" of type "Chiller" as a proxy storage
    // This is a workaround to avoid schema migrations
    const existing = await prisma.logsheet_templates.findFirst({
      where: {
        project_id: pId,
        name: templateName
      }
    });

    if (existing) {
      await prisma.logsheet_templates.update({
        where: { id: existing.id },
        data: { parameters_json: payload }
      });
    } else {
      await prisma.logsheet_templates.create({
        data: {
          project_id: pId,
          name: templateName,
          type: "Chiller", // Required enum
          parameters_json: payload,
          is_active: false // Mark as inactive so it doesn't show up in normal logsheet lists
        }
      });
    }

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Save VES Schedule Error:", error);
    return { error: "Failed to persist schedule data" };
  }
}

/**
 * Load the Shift Roster
 */
export async function getVesSchedule(projectId: string, year: number, month: number) {
  try {
    const templateName = `ROSTER_${year}_${month + 1}`;
    const pId = BigInt(projectId);

    const data = await prisma.logsheet_templates.findFirst({
      where: {
        project_id: pId,
        name: templateName
      }
    });

    if (!data) return { success: true, data: null };

    return {
      success: true,
      data: JSON.parse(data.parameters_json)
    };
  } catch (error) {
    console.error("Get VES Schedule Error:", error);
    return { error: "Failed to load schedule data" };
  }
}
