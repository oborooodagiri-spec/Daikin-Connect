"use server";

import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";
import { getSession } from "./auth";
import { service_activities_type } from "@/generated/client_v3";

interface RoesminLogsheetData {
  date: string;
  inspector: string;
  id?: string | number;
  isDraft?: boolean;
  formData: Record<string, Record<string, string>>;
  sections: Array<{
    id: string;
    label: string;
      groups: Array<{
        id: string;
        label: string;
        color?: string;
        units: Array<{
          id: string;
          label: string;
          params: Array<{
            key: string;
            label: string;
            type?: string;
            unit?: string;
            options?: string[];
            design?: string;
          }>;
        }>;
      }>;
  }>;
}

/**
 * Save a Roesmin logsheet entry as a service_activities record.
 * Uses the technical_json column to store the full logsheet data.
 */
export async function saveRoesminLogsheet(data: RoesminLogsheetData, projectId?: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  try {
    let targetUnitId = 17588; // Default fallback
    let projectName = "General Project";

    if (projectId) {
      const project = await prisma.projects.findUnique({ where: { id: Number(projectId) } });
      if (project) {
        projectName = project.name;
      }

      // Check if Virtual Room exists
      const virtualUnit = await prisma.units.findFirst({
        where: {
          project_id: projectId,
          unit_type: "Virtual Room",
          tag_number: "LOGSHEET-ROOM"
        }
      });

      if (virtualUnit) {
        targetUnitId = virtualUnit.id;
      } else {
        // Create Virtual Unit
        const newVirtual = await prisma.units.create({
          data: {
            project_id: String(projectId),
            unit_type: "Virtual Room",
            tag_number: "LOGSHEET-ROOM",
            brand: "DSSI Connect",
            model: "Logsheet System",
            location: "Virtual Space",
            area: "Facility Wide",
          }
        });
        targetUnitId = newVirtual.id;
      }
    }

    const techJson = JSON.stringify({
      is_roesmin_logsheet: true,
      date: data.date,
      inspector: data.inspector,
      sections: data.sections,
      formData: data.formData,
      project_id: projectId,
      is_draft: data.isDraft || false
    });

    let activityRecord;
    if (data.id) {
      activityRecord = await (prisma.service_activities as any).update({
        where: { id: Number(data.id) },
        data: {
          service_date: new Date(data.date),
          inspector_name: data.inspector,
          technical_json: techJson,
        }
      });
    } else {
      activityRecord = await (prisma.service_activities as any).create({
        data: {
          unit_id: targetUnitId,
          type: service_activities_type.Preventive,
          service_date: new Date(data.date),
          inspector_name: data.inspector,
          engineer_note: `Daily Logsheet - ${projectName}${data.isDraft ? ' (DRAFT)' : ''}`,
          technical_json: techJson,
          technical_advice: "Daily HVAC Monitoring Logsheet",
          location: projectName,
          unit_tag: "LOGSHEET-ROESMIN",
        },
      });
    }

    return { success: true, id: serializePrisma(activityRecord.id) };
  } catch (error) {
    console.error("Save Roesmin logsheet error:", error);
    return { success: false, error: "Failed to save logsheet" };
  }
}

interface RoesminLogsheetFilters {
  dateFrom?: string;
  dateTo?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieve Roesmin logsheet entries with optional date filtering and pagination.
 */
export async function getRoesminLogsheets(filters?: RoesminLogsheetFilters) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  try {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      unit_tag: "LOGSHEET-ROESMIN",
      deleted_at: null,
    };

    if (filters?.projectId) {
      where.units = { project_id: String(filters.projectId) };
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.service_date = {};
      if (filters.dateFrom) {
        where.service_date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.service_date.lte = new Date(filters.dateTo);
      }
    }

    const [entries, total] = await Promise.all([
      (prisma.service_activities as any).findMany({
        where,
        orderBy: { service_date: "desc" },
        skip,
        take: limit,
      }),
      (prisma.service_activities as any).count({ where }),
    ]);

    return serializePrisma({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Roesmin logsheets error:", error);
    return { success: false, error: "Failed to fetch logsheets" };
  }
}
