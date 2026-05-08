"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/serialize";
import { getSession } from "./auth";
import { LogsheetType } from "@/generated/client_v2"; // We need to check exact path for enum after build

/**
 * Get all logsheet templates for a project
 */
export async function getLogsheetTemplates(projectId: string) {
  try {
    const templates = await prisma.logsheet_templates.findMany({
      where: { project_id: BigInt(projectId), is_active: true },
      orderBy: { created_at: "desc" },
    });
    return serializePrisma({ success: true, data: templates });
  } catch (error) {
    console.error("Get templates error:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

/**
 * Create a new logsheet template
 */
export async function createLogsheetTemplate(projectId: string, data: any) {
  try {
    const template = await prisma.logsheet_templates.create({
      data: {
        project_id: BigInt(projectId),
        name: data.name,
        type: data.type,
        system_name: data.system_name,
        room_name: data.room_name,
        parameters_json: JSON.stringify(data.parameters),
        design_json: JSON.stringify(data.designValues || {}),
        time_slots: data.time_slots?.join(","),
      },
    });
    revalidatePath(`/w/${projectId}/dashboard/logsheets`);
    return serializePrisma({ success: true, data: template });
  } catch (error) {
    console.error("Create template error:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Submit/Add a reading entry
 */
export async function submitLogsheetEntry(templateId: number, data: any) {
  try {
    // Upsert entry based on template_id, date, and time
    const date = new Date(data.log_date);
    date.setHours(0, 0, 0, 0);

    const entry = await prisma.logsheet_entries.upsert({
      where: {
        template_id_log_date_log_time: {
          template_id: templateId,
          log_date: date,
          log_time: data.log_time,
        },
      },
      update: {
        recorded_by: data.recorded_by,
        values_json: JSON.stringify(data.values),
        notes: data.notes,
      },
      create: {
        template_id: templateId,
        log_date: date,
        log_time: data.log_time,
        recorded_by: data.recorded_by,
        values_json: JSON.stringify(data.values),
        notes: data.notes,
      },
      include: { template: true }
    });

    revalidatePath(`/w/${entry.template.project_id.toString()}/dashboard/logsheets`);
    return serializePrisma({ success: true, data: entry });
  } catch (error) {
    console.error("Submit entry error:", error);
    return { success: false, error: "Failed to submit entry" };
  }
}

/**
 * Get all entries for a template on a specific date
 */
export async function getLogsheetEntries(templateId: number, dateStr: string) {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const entries = await prisma.logsheet_entries.findMany({
      where: {
        template_id: templateId,
        log_date: date,
      },
      orderBy: { log_time: "asc" },
    });
    
    return serializePrisma({ success: true, data: entries });
  } catch (error) {
    console.error("Get entries error:", error);
    return { success: false, error: "Failed to fetch entries" };
  }
}

/**
 * Delete an entry
 */
export async function deleteLogsheetEntry(entryId: number) {
  const session = await getSession();
  if (!session || !session.isInternal) {
    return { success: false, error: "Unauthorized: Deletion requires internal staff privileges." };
  }

  try {
    const entry = await prisma.logsheet_entries.delete({
      where: { id: entryId },
      include: { template: true }
    });
    revalidatePath(`/w/${entry.template.project_id.toString()}/dashboard/logsheets`);
    return { success: true };
  } catch (error) {
    console.error("Delete entry error:", error);
    return { success: false, error: "Failed to delete entry" };
  }
}
