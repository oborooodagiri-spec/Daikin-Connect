"use server";

import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/serialize";
import { getSession } from "./auth";

interface RoesminLogsheetData {
  date: string;
  inspector: string;
  formData: Record<string, Record<string, string>>;
  sections: Array<{
    id: string;
    label: string;
    groups: Array<{
      id: string;
      label: string;
      fields: Array<{
        id: string;
        label: string;
        type?: string;
        unit?: string;
        options?: string[];
      }>;
    }>;
  }>;
}

/**
 * Save a Roesmin logsheet entry as a service_activities record.
 * Uses the technical_json column to store the full logsheet data.
 */
export async function saveRoesminLogsheet(data: RoesminLogsheetData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  try {
    const newActivity = await (prisma.service_activities as any).create({
      data: {
        unit_id: 17588,
        type: "Preventive",
        service_date: new Date(data.date),
        inspector_name: data.inspector,
        engineer_note:
          "Daily Logsheet - Lanud Roesmin Nurjadin - Rafale Simulator",
        technical_json: JSON.stringify({
          is_roesmin_logsheet: true,
          date: data.date,
          inspector: data.inspector,
          sections: data.sections,
          formData: data.formData,
        }),
        technical_advice: "Daily HVAC Monitoring Logsheet",
        location: "Lanud Roesmin Nurjadin - Rafale Simulator",
        unit_tag: "LOGSHEET-ROESMIN",
      },
    });

    return { success: true, id: serializePrisma(newActivity.id) };
  } catch (error) {
    console.error("Save Roesmin logsheet error:", error);
    return { success: false, error: "Failed to save logsheet" };
  }
}

interface RoesminLogsheetFilters {
  dateFrom?: string;
  dateTo?: string;
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
