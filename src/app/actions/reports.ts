"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";

export async function getAllReports(filters?: {
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (filters?.type && filters.type !== "all") {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.service_date = {};
      if (filters?.dateFrom) where.service_date.gte = new Date(filters.dateFrom);
      if (filters?.dateTo) where.service_date.lte = new Date(filters.dateTo);
    }

    if (filters?.search) {
      where.OR = [
        { inspector_name: { contains: filters.search } },
        { unit_tag: { contains: filters.search } },
        { location: { contains: filters.search } },
        { engineer_note: { contains: filters.search } },
      ];
    }

    const [reports, total] = await Promise.all([
      (prisma.service_activities as any).findMany({
        where,
        include: {
          units: {
            select: {
              id: true,
              tag_number: true,
              brand: true,
              model: true,
              area: true,
              building_floor: true,
              room_tenant: true,
              qr_code_token: true,
            },
          },
          activity_photos: {
            select: { id: true, photo_url: true, description: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      (prisma.service_activities as any).count({ where }),
    ]);

    // Also pull legacy corrective records
    const legacyCorrective = await (prisma.corrective as any).findMany({
      include: {
        units: {
          select: {
            id: true,
            tag_number: true,
            brand: true,
            model: true,
            area: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    // Stats
    const [totalAudit, totalPreventive, totalCorrective] = await Promise.all([
      (prisma.service_activities as any).count({ where: { type: "Audit" } }),
      (prisma.service_activities as any).count({ where: { type: "Preventive" } }),
      (prisma.service_activities as any).count({ where: { type: "Corrective" } }),
    ]);

    return serializePrisma({
      success: true,
      data: reports.map((r: any) => ({
        ...r,
        id: r.id.toString(),
        created_at: r.created_at?.toISOString() || "",
        service_date: r.service_date?.toISOString() || "",
      })),
      legacyCorrective: legacyCorrective.map((r: any) => ({
        ...r,
        id: r.id.toString(),
        created_at: r.created_at?.toISOString() || "",
        service_date: r.service_date?.toISOString() || "",
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        totalAudit,
        totalPreventive,
        totalCorrective,
        totalAll: totalAudit + totalPreventive + totalCorrective,
      },
    });
  } catch (error: any) {
    console.error("Fetch Reports Error:", error);
    return { error: error.message || "Failed to fetch reports" };
  }
}

export async function getReportDetail(id: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const report = await (prisma.service_activities as any).findUnique({
      where: { id: parseInt(id) },
      include: {
        units: true,
        activity_photos: true,
        audit_velocity_points: true,
      },
    });

    if (!report) return { error: "Report not found" };

    return serializePrisma({
      success: true,
      data: {
        ...report,
        id: report.id.toString(),
        created_at: report.created_at?.toISOString() || "",
        service_date: report.service_date?.toISOString() || "",
      },
    });
  } catch (error: any) {
    console.error("Fetch Report Detail Error:", error);
    return { error: error.message };
  }
}

