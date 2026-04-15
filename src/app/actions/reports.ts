"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";

export async function getAllReports(filters?: {
  type?: string;
  projectId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  console.log("DIAGNOSTIC: getAllReports - Session:", session ? "Found" : "Missing");
  if (!session) return { error: "Unauthorized" };

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  try {
    const where: any = { deleted_at: null };
    
    // Check total count before any filters
    const debugCount = await (prisma.service_activities as any).count();
    console.log("DIAGNOSTIC: Total service_activities in DB:", debugCount);

    if (filters?.type && filters.type !== "all") {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.service_date = {};
      if (filters?.dateFrom) where.service_date.gte = new Date(filters.dateFrom);
      if (filters?.dateTo) where.service_date.lte = new Date(filters.dateTo);
    }

    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        { inspector_name: { contains: search } },
        { unit_tag: { contains: search } },
        { location: { contains: search } },
        { engineer_note: { contains: search } },
        { units: { room_tenant: { contains: search } } },
        { units: { area: { contains: search } } },
        { units: { model: { contains: search } } },
        { units: { serial_number: { contains: search } } },
      ];
    }
    
    // WORKSPACE ISOLATION: FILTER BY PROJECT ID
    if (filters?.projectId && filters.projectId !== "empty") {
      where.units = { ...where.units, project_ref_id: Number(filters.projectId) };
    }

    // DAILY OPS LOG
    let dailyLogs: any[] = [];
    let totalDailyLogDb = 0;
    const includeDailyLog = !filters?.type || filters.type === "all" || filters.type === "DailyLog";
    
    if (includeDailyLog) {
       const logWhere: any = {};
       if (filters?.projectId && filters.projectId !== "empty") {
         logWhere.units = { project_ref_id: Number(filters.projectId) };
       }
       if (filters?.dateFrom) { logWhere.service_date = logWhere.service_date || {}; logWhere.service_date.gte = new Date(filters.dateFrom); }
       if (filters?.dateTo) { logWhere.service_date = logWhere.service_date || {}; logWhere.service_date.lte = new Date(filters.dateTo); }
       if (filters?.search) {
         logWhere.OR = [
           { inspector_name: { contains: filters.search } },
           { notes: { contains: filters.search } }
         ];
       }

       [dailyLogs, totalDailyLogDb] = await Promise.all([
         (prisma.daily_ops_logs as any).findMany({
           where: logWhere,
           include: {
             units: {
               select: { id: true, tag_number: true, brand: true, model: true, area: true, building_floor: true, room_tenant: true }
             }
           },
           orderBy: { created_at: "desc" },
           take: limit
         }),
         (prisma.daily_ops_logs as any).count({ where: logWhere })
       ]);
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
            select: { id: true, photo_url: true, description: true, media_type: true },
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
      (prisma.service_activities as any).count({ where: { ...where, type: "Audit" } }),
      (prisma.service_activities as any).count({ where: { ...where, type: "Preventive" } }),
      (prisma.service_activities as any).count({ where: { ...where, type: "Corrective" } }),
    ]);

    const mappedDailyLogs = dailyLogs.map((dl: any) => ({
      id: "DL-" + dl.id, // Prefix DL to prevent ID collision
      type: "DailyLog",
      unit_id: dl.unit_id,
      inspector_name: dl.inspector_name,
      service_date: dl.service_date,
      created_at: dl.created_at,
      status: "Verified",
      engineer_note: dl.notes,
      units: dl.units,
      activity_photos: [] // Daily logs don't have direct photos in schema
    }));

    // Merge and re-sort
    let mergedReports = [...reports, ...mappedDailyLogs].sort((a, b) => {
      const dateA = new Date(b.created_at || 0).getTime();
      const dateB = new Date(a.created_at || 0).getTime();
      return dateA - dateB; 
    }).slice(0, limit);

    const grandTotal = total + totalDailyLogDb;

    return serializePrisma({
      success: true,
      data: mergedReports.map((r: any) => ({
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
      pagination: { total: grandTotal, page, limit, totalPages: Math.ceil(grandTotal / limit) },
      stats: {
        totalAudit,
        totalPreventive,
        totalCorrective,
        totalDailyLog: totalDailyLogDb,
        totalAll: totalAudit + totalPreventive + totalCorrective + totalDailyLogDb,
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
    if (id.startsWith("DL-")) {
      const logId = parseInt(id.replace("DL-", ""));
      const dlReport = await (prisma.daily_ops_logs as any).findUnique({
        where: { id: logId },
        include: { units: true }
      });
      if (!dlReport) return { error: "Daily Log not found" };

      return serializePrisma({
        success: true,
        data: {
          ...dlReport,
          id: id,
          type: "DailyLog",
          created_at: dlReport.created_at?.toISOString() || "",
          service_date: dlReport.service_date?.toISOString() || "",
          activity_photos: [] // Required by UI
        }
      });
    }

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

export async function getSummaryData(dateFrom: string, dateTo: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    // 1. Fetch all activities in range
    const activities = await (prisma.service_activities as any).findMany({
      where: {
        service_date: { gte: from, lte: to }
      },
      include: {
        units: true
      },
      orderBy: { service_date: "asc" }
    });

    // 2. Fetch all schedules in range
    const schedules = await (prisma.schedules as any).findMany({
      where: {
        start_at: { gte: from, lte: to }
      },
      include: {
        units: true
      }
    });

    // 3. Process Daily Services (Preventive & Audit)
    const dailyServices = activities.filter((a: any) => a.type !== "Corrective").map((a: any) => {
      let t: any = {};
      try { t = JSON.parse(a.technical_json || "{}"); if(typeof t === 'string') t = JSON.parse(t); } catch(e) {}
      
      return {
        date: a.service_date,
        floor: a.units?.building_floor || "-",
        room: a.units?.room_tenant || "-",
        brand: a.units?.brand || "-",
        model: a.units?.model || "-",
        type: a.units?.unit_type || "-",
        finding: a.engineer_note || "-",
        status: t.serviceStatus || "SERVICED",
        reason: t.noServiceReason || ""
      };
    });

    // 4. Process Complaints (Corrective)
    const complaints = activities.filter((a: any) => a.type === "Corrective").map((a: any) => {
      let t: any = {};
      try { t = JSON.parse(a.technical_json || "{}"); if(typeof t === 'string') t = JSON.parse(t); } catch(e) {}
      
      const analysis = t.analysis || {};
      return {
        date: a.service_date,
        time: t.personnel?.service_time || "-",
        floor: a.units?.building_floor || "-",
        room: a.units?.room_tenant || "-",
        unitType: a.units?.unit_type || "-",
        tag: a.units?.tag_number || "-",
        brand: a.units?.brand || "-",
        model: a.units?.model || "-",
        technician: a.inspector_name || "-",
        category: t.category || "General",
        rootCause: analysis.root_cause || "-",
        tempAction: analysis.temp_action || "-",
        permAction: analysis.perm_action || "-",
        recommendation: analysis.recommendation || "-",
        lastPm: t.lastPreventiveDate || "-",
        currentStatus: a.units?.status || "Normal"
      };
    });

    // 5. Calculate Performance Charts
    const totalPmScheduled = schedules.filter((s: any) => s.type === "Preventive").length;
    const pmActivities = activities.filter((a: any) => a.type === "Preventive");
    
    // On Schedule vs Delay
    let onSchedule = 0;
    let delay = 0;
    let outOfSchedule = 0;

    pmActivities.forEach((a: any) => {
      const match = schedules.find((s: any) => s.unit_id === a.unit_id && s.type === "Preventive");
      if (match) {
        if (new Date(a.service_date) <= new Date(match.end_at)) onSchedule++;
        else delay++;
      } else {
        outOfSchedule++;
      }
    });

    // Non-Service Reasons Breakdown
    const reasonCounts: Record<string, number> = {};
    dailyServices.forEach((s: any) => {
      if (s.status === "NOT_SERVICED" && s.reason) {
        reasonCounts[s.reason] = (reasonCounts[s.reason] || 0) + 1;
      }
    });

    // Complaint Categories Breakdown
    const complaintCats: Record<string, number> = {};
    complaints.forEach((c: any) => {
      complaintCats[c.category] = (complaintCats[c.category] || 0) + 1;
    });

    return serializePrisma({
      success: true,
      data: {
        period: { from: dateFrom, to: dateTo },
        dailyServices,
        complaints,
        performance: {
          pm: {
            totalScheduled: totalPmScheduled,
            onSchedule,
            delay,
            outOfSchedule,
            totalServiced: pmActivities.length
          },
          reasons: Object.entries(reasonCounts).map(([label, value]) => ({ label, value })),
          complaintCategories: Object.entries(complaintCats).map(([label, value]) => ({ label, value }))
        }
      }
    });
  } catch (error: any) {
    console.error("Generate Summary Data Error:", error);
    return { error: error.message };
  }
}

