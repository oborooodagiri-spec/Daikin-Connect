"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

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

/**
 * Remove a person from the Shift Roster (Admin only)
 */
export async function removePersonFromSchedule(
  projectId: string,
  year: number,
  month: number,
  personId: string
) {
  try {
    // Admin check
    const session = await getSession();
    const isAdmin = session?.roles?.some((role: string) =>
      ["admin", "super", "administrator", "management"].some(keyword => role.toLowerCase().includes(keyword))
    );
    if (!isAdmin) return { error: "Only admins can remove personnel from schedule" };

    const templateName = `ROSTER_${year}_${month + 1}`;
    const pId = BigInt(projectId);

    const existing = await prisma.logsheet_templates.findFirst({
      where: { project_id: pId, name: templateName }
    });

    if (!existing) return { error: "Schedule not found for this period" };

    const data = JSON.parse(existing.parameters_json);

    // Remove person from people array
    data.people = (data.people || []).filter((p: any) => p.id !== personId && p.id?.toString() !== personId);

    // Remove their schedule entries
    if (data.schedule && data.schedule[personId]) {
      delete data.schedule[personId];
    }

    data.updatedAt = new Date().toISOString();

    await prisma.logsheet_templates.update({
      where: { id: existing.id },
      data: { parameters_json: JSON.stringify(data) }
    });

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Remove Person Error:", error);
    return { error: "Failed to remove personnel" };
  }
}
