"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Access Control Helper
 */
async function getAccessibleProjectIds() {
  const session = await getSession();
  if (!session) return [];
  if (session.isInternal) return null; // All access

  const access = await prisma.user_project_access.findMany({
    where: { user_id: parseInt(session.userId, 10) },
    select: { project_id: true }
  });
  return access.map(a => a.project_id);
}

/**
 * Fetch Filter Options (Hierarchical)
 */
export async function getFilterOptions() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const accessibleIds = await getAccessibleProjectIds();

  const customers = await (prisma.customers as any).findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      projects: {
        where: accessibleIds ? { id: { in: accessibleIds } } : {},
        select: { id: true, name: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return serializePrisma({ success: true, data: customers.map((c: any) => ({
    ...c,
    projects: c.projects.map((p: any) => ({ id: p.id.toString(), name: p.name }))
  })) });
}

/**
 * Main Dashboard Stats (Refined 3-Tier)
 */
export async function getDashboardData(filters: { customerId?: string; projectId?: string }) {
  noStore();
  try {
    const accessibleIds = await getAccessibleProjectIds();
    
    // Dates
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Build where clause based on filter + permissions
    const unitWhere: any = {};
    const baseActivityWhere: any = {};

    if (filters.projectId) {
      unitWhere.project_ref_id = BigInt(filters.projectId);
      baseActivityWhere.units = { project_ref_id: BigInt(filters.projectId) };
    } else if (filters.customerId) {
      unitWhere.projects = { customer_id: parseInt(filters.customerId) };
      baseActivityWhere.units = { projects: { customer_id: parseInt(filters.customerId) } };
    }

    // Apply security constraints
    if (accessibleIds) {
      const ids = accessibleIds.map(id => BigInt(id));
      if (unitWhere.project_ref_id) {
        if (!ids.includes(unitWhere.project_ref_id)) return emptyStats();
      } else {
        unitWhere.project_ref_id = { in: ids };
        baseActivityWhere.units = { ...baseActivityWhere.units, project_ref_id: { in: ids } };
      }
    }

    // 2. Fetch Actuals for Daily, Monthly, Total
    const fetchTypeActuals = async (type: string) => {
      const [daily, monthly, total] = await Promise.all([
        (prisma.service_activities as any).count({ 
          where: { ...baseActivityWhere, type, service_date: { gte: startOfToday, lte: endOfToday } } 
        }),
        (prisma.service_activities as any).count({ 
          where: { ...baseActivityWhere, type, service_date: { gte: startOfMonth } } 
        }),
        (prisma.service_activities as any).count({ 
          where: { ...baseActivityWhere, type, service_date: { gte: startOfYear } } 
        }),
      ]);
      return { daily, monthly, total };
    };

    // 3. Fetch Targets for Daily, Monthly, Year
    const fetchTypeTargets = async (type: string) => {
      const targets = await (prisma.schedule_targets as any).findMany({
        where: {
          type,
          month: currentMonth,
          year: currentYear,
          ...(filters.projectId ? { project_id: BigInt(filters.projectId) } : {}),
          ...(accessibleIds ? { project_id: { in: accessibleIds.map(id => BigInt(id)) } } : {})
        }
      });
      
      const monthly = targets.reduce((sum: number, t: any) => sum + (t.monthly_target || 0), 0);
      const daily = targets.reduce((sum: number, t: any) => sum + (t.daily_target || 0), 0);
      const yearly = targets.reduce((sum: number, t: any) => sum + (t.yearly_target || 0), 0);
      
      return { 
        daily: daily || Math.ceil(monthly / 20) || 1, 
        monthly: monthly || 0,
        total: yearly || (monthly * 12) // Fallback to 12x monthly if yearly not set
      };
    };

    // 4. Specialized Corrective Stats (Resolution Rate)
    const fetchCorrectiveKPI = async () => {
      const scheduleWhere: any = { 
        type: "Corrective",
        start_at: { gte: startOfMonth }
      };
      if (filters.projectId) scheduleWhere.project_id = BigInt(filters.projectId);
      else if (accessibleIds) scheduleWhere.project_id = { in: accessibleIds.map(id => BigInt(id)) };

      const [appeared, resolved] = await Promise.all([
        (prisma.schedules as any).count({ where: scheduleWhere }),
        (prisma.schedules as any).count({ where: { ...scheduleWhere, status: "Completed" } })
      ]);

      return { appeared, resolved };
    };

    // Helper for Raw Daily Log counts (Workaround for Prisma Generate lock)
    const fetchDailyLogRaw = async (startDate: Date, endDate?: Date) => {
      try {
        // Get all unit IDs for the current filter first
        const unitsList = await (prisma.units as any).findMany({
          where: unitWhere,
          select: { id: true }
        });
        const ids = unitsList.map((u: any) => u.id);
        if (ids.length === 0) return 0;

        const result: any[] = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM daily_ops_logs 
          WHERE unit_id IN (${ids.join(',')})
          AND service_date >= ${startDate}
          ${endDate ? prisma.$queryRaw`AND service_date <= ${endDate}` : prisma.$queryRaw``}
        `;
        // Handle BigInt result from raw query
        return Number(result[0]?.count || 0);
      } catch (e) {
        console.error("DailyLog Raw Query Error:", e);
        return 0;
      }
    };

    // Optimization: For Postgres/MySQL IN clauses with BigInt in Raw SQL can be tricky.
    // Let's use a cleaner approach for IDs or just use the model query if generate succeeds.
    // However, since we know generate failed, I'll use a safer raw query construction.

    const getDailyLogCount = async (start: Date, end: Date | null = null) => {
       try {
         // Fallback if generate is stuck: count via unit join
         const pid = filters.projectId ? BigInt(filters.projectId) : null;
         const cid = filters.customerId ? parseInt(filters.customerId) : null;
         
         let query = `SELECT COUNT(*) as count FROM daily_ops_logs d JOIN units u ON d.unit_id = u.id`;
         let conditions = [
           `d.service_date >= '${start.toISOString().split('T')[0]}'`
         ];
         if (end) conditions.push(`d.service_date <= '${end.toISOString().split('T')[0]}'`);
         if (pid) conditions.push(`u.project_ref_id = ${pid}`);
         if (cid) conditions.push(`u.project_ref_id IN (SELECT id FROM projects WHERE customer_id = ${cid})`);
         
         // Access control
         if (accessibleIds && accessibleIds.length > 0) {
           conditions.push(`u.project_ref_id IN (${accessibleIds.join(',')})`);
         } else if (accessibleIds && accessibleIds.length === 0) {
           // User has role restrictions but zero projects. Return 0 instantly.
           return 0;
         }

         const sql = `${query} WHERE ${conditions.join(' AND ')}`;
         const res: any[] = await prisma.$queryRawUnsafe(sql);
         return Number(res[0]?.count || 0);
       } catch (err) {
         console.error("Raw SQL Failure:", err);
         return 0;
       }
    };

    // helper for project config fetch
    const fetchEnabledForms = async (pid: string) => {
      if (!pid || pid === "undefined") return "Audit,Preventive,Corrective"; // UI-Safe fallback
      try {
        const project = await (prisma.projects as any).findUnique({
          where: { id: BigInt(pid) },
          select: { enabled_forms: true }
        });
        
        // If project found but no forms configured, use default
        if (project && project.enabled_forms) return project.enabled_forms;
        return "Audit,Preventive,Corrective"; 
      } catch (e) {
        console.error("Dashboard Config Sync Error:", e);
        return "Audit,Preventive,Corrective"; // Resilience: Show major cards on error
      }
    };

    const [
      auditActual, auditTarget, 
      pmActual, pmTargetMetrics, 
      corKPI,
      corActual,
      dailyLogDaily, dailyLogMonthly, dailyLogTotal,
      dailyLogTarget,
      totalUnits,
      activeProjects,
      totalCustomers,
      enabledFormsRaw
    ] = await Promise.all([
      fetchTypeActuals("Audit").catch(() => ({ daily:0, monthly:0, total:0 })),
      fetchTypeTargets("Audit").catch(() => ({ daily:0, monthly:0, total:0 })),
      fetchTypeActuals("Preventive").catch(() => ({ daily:0, monthly:0, total:0 })),
      fetchTypeTargets("Preventive").catch(() => ({ daily:0, monthly:0, total:0 })),
      fetchCorrectiveKPI().catch(() => ({ appeared:0, resolved:0 })),
      fetchTypeActuals("Corrective").catch(() => ({ daily:0, monthly:0, total:0 })),
      getDailyLogCount(startOfToday, endOfToday).catch(() => 0),
      getDailyLogCount(startOfMonth).catch(() => 0),
      getDailyLogCount(startOfYear).catch(() => 0),
      fetchTypeTargets("DailyLog").catch(() => ({ daily:0, monthly:0, total:0 })),
      (prisma.units as any).count({ where: unitWhere }).catch(() => 0),
      (prisma.projects as any).count({ 
        where: { 
          status: "active", 
          ...(filters.customerId ? { customer_id: parseInt(filters.customerId) } : {}),
          ...(accessibleIds ? { id: { in: accessibleIds } } : {})
        } 
      }).catch(() => 0),
      (filters.customerId ? Promise.resolve(1) : (prisma.customers as any).count({ where: { is_active: true } })).catch(() => 0),
      fetchEnabledForms(filters.projectId || "")
    ]);

    // Split and handle mapping 
    const formsArray = (enabledFormsRaw || "Audit,Preventive,Corrective")
      .split(",")
      .map((s: string) => {
        const clean = s.trim().toLowerCase();
        if (clean.includes("daily") || clean.includes("operational") || clean.includes("log")) return "dailylog";
        if (clean.includes("audit")) return "audit";
        if (clean.includes("preventive")) return "preventive";
        if (clean.includes("corrective")) return "corrective";
        return clean.replace(/\s+/g, '');
      }).filter(Boolean);

    return serializePrisma({
      audit: { actual: auditActual, target: auditTarget },
      preventive: { actual: pmActual, target: pmTargetMetrics },
      corrective: { 
        actual: corActual, 
        kpi: corKPI 
      }, 
      dailyLog: { 
        actual: { daily: dailyLogDaily, monthly: dailyLogMonthly, total: dailyLogTotal }, 
        target: dailyLogTarget 
      },
      databaseAssets: totalUnits,
      activeSites: activeProjects,
      totalCustomers: totalCustomers,
      enabled_forms: formsArray.join(",")
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return emptyStats();
  }
}

export async function getHealthStats(filters: { customerId?: string; projectId?: string }) {
   return [];
}

function emptyStats() {
  return { 
    audit: { actual: { daily:0, monthly:0, total:0 }, target: { daily:0, monthly:0, total:0 } }, 
    preventive: { actual: { daily:0, monthly:0, total:0 }, target: { daily:0, monthly:0, total:0 } }, 
    corrective: { actual: { daily:0, monthly:0, total:0 }, target: { daily:0, monthly:0, total:0 }, kpi: { appeared: 0, resolved: 0 } }, 
    dailyLog: { actual: { daily: 0, monthly: 0, total: 0 }, target: { daily: 0, monthly: 0, total: 0 } },
    databaseAssets: 0, activeSites: 0, totalCustomers: 0,
    enabled_forms: "audit,preventive,corrective,dailylog"
  };
}

/**
 * Real-Time Trend Data (By Month)
 */
export async function getTrendChartData(filters: { customerId?: string; projectId?: string }) {
  noStore();
  try {
    const activityWhere: any = {};
    if (filters.projectId) {
      activityWhere.units = { project_ref_id: BigInt(filters.projectId) };
    } else if (filters.customerId) {
      activityWhere.units = { projects: { customer_id: parseInt(filters.customerId) } };
    }

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const accessibleIds = await getAccessibleProjectIds();
    
    // 1. Fetch Service Activities (Old Table)
    let activities: any[] = [];
    try {
      activities = await (prisma.service_activities as any).findMany({
        where: { ...activityWhere, service_date: { gte: startOfYear } },
        select: { service_date: true, type: true }
      });
    } catch (e) {
      console.error("Trend Activities Error:", e);
    }

    // 2. Fetch Daily Logs (New Table - Raw SQL Fallback)
    let dailyLogs: any[] = [];
    try {
      const pid = filters.projectId ? BigInt(filters.projectId) : null;
      const cid = filters.customerId ? parseInt(filters.customerId) : null;

      let conditions = [`d.service_date >= '${startOfYear.toISOString().split('T')[0]}'`];
      if (pid) conditions.push(`u.project_ref_id = ${pid}`);
      if (cid) conditions.push(`u.project_ref_id IN (SELECT id FROM projects WHERE customer_id = ${cid})`);
      
      if (accessibleIds && accessibleIds.length > 0) {
        conditions.push(`u.project_ref_id IN (${accessibleIds.join(",")})`);
      } else if (accessibleIds && accessibleIds.length === 0) {
        conditions.push(`1=0`); // Force no results if restricted and 0 projects
      }

      const sql = `SELECT d.service_date FROM daily_ops_logs d JOIN units u ON d.unit_id = u.id WHERE ${conditions.join(" AND ")}`;
      dailyLogs = await prisma.$queryRawUnsafe(sql) as any[];
    } catch (e) {
      console.error("Trend DailyLogs Error:", e);
    }

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentMonth = new Date().getMonth();
    
    const chartData = months.slice(0, currentMonth + 1).map((name, i) => {
      const monthActivities = activities.filter((a: any) => a.service_date && new Date(a.service_date).getMonth() === i);
      const monthDailyLogs = dailyLogs.filter((l: any) => l.service_date && new Date(l.service_date).getMonth() === i);
      
      return {
        name,
        audit: monthActivities.filter((a: any) => a.type === "Audit").length,
        preventive: monthActivities.filter((a: any) => a.type === "Preventive").length,
        corrective: monthActivities.filter((a: any) => a.type === "Corrective").length,
        dailyLog: monthDailyLogs.length
      };
    });

    return serializePrisma(chartData);
  } catch (error) {
    console.error("Global Trend Error:", error);
    return [];
  }
}

/**
 * Recent Activity Feed
 */
export async function getRecentActivities(filters: { customerId?: string; projectId?: string }) {
  noStore();
  try {
    const activityWhere: any = {};
    if (filters.projectId) {
      activityWhere.units = { project_ref_id: BigInt(filters.projectId) };
    } else if (filters.customerId) {
      activityWhere.units = { projects: { customer_id: parseInt(filters.customerId) } };
    }

    const recent = await (prisma.service_activities as any).findMany({
      where: activityWhere,
      take: 8,
      orderBy: { created_at: "desc" },
      include: {
        units: { select: { tag_number: true, location: true, area: true, room_tenant: true } }
      }
    });

    return serializePrisma(recent.map((r: any) => ({
      id: r.id.toString(),
      type: r.type,
      engineer: r.inspector_name || "Unknown",
      unit_tag: r.units?.tag_number || "Unknown Unit",
      room_tenant: r.units?.room_tenant || "",
      location: r.units?.area || r.units?.location || "-",
      at: r.created_at?.toISOString() || ""
    })));
  } catch (err) {
    return [];
  }
}

/**
 * Unit Health Stats breakdown
 */
export async function getUnitHealthStats(filters: { customerId?: string; projectId?: string }) {
  noStore();
  try {
    const unitWhere: any = {};
    if (filters.projectId) {
      unitWhere.project_ref_id = BigInt(filters.projectId);
    } else if (filters.customerId) {
      unitWhere.projects = { customer_id: parseInt(filters.customerId) };
    }

    const stats = await prisma.units.groupBy({
      by: ["status"],
      where: unitWhere,
      _count: true
    } as any);

    return serializePrisma(stats.map((s: any) => ({
      status: s.status || "Unknown",
      count: s._count
    })));
  } catch (err) {
    return [];
  }
}

/**
 * Fetch top units by status for widgets
 */
export async function getDetailedUnitStatus(filters: { customerId?: string; projectId?: string }) {
  noStore();
  try {
    const unitWhere: any = {};
    if (filters.projectId) {
      unitWhere.project_ref_id = BigInt(filters.projectId);
    } else if (filters.customerId) {
      unitWhere.projects = { customer_id: parseInt(filters.customerId) };
    }

    const [problems, progress] = await Promise.all([
      (prisma.units as any).findMany({
        where: { ...unitWhere, status: { in: ["Problem", "Critical", "Warning"] } },
        take: 5,
        orderBy: { created_at: "asc" }, // Oldest first (Request aging)
        select: { id: true, tag_number: true, area: true, model: true, room_tenant: true, status: true, created_at: true, project_ref_id: true, qr_code_token: true, projects: { select: { name: true } } }
      }),
      (prisma.units as any).findMany({
        where: { ...unitWhere, status: { in: ["On_Progress", "Pending"] } },
        take: 5,
        orderBy: { created_at: "desc" }, // Newest first for on-progress
        select: { id: true, tag_number: true, area: true, model: true, room_tenant: true, status: true, created_at: true, project_ref_id: true, qr_code_token: true, projects: { select: { name: true } } }
      })
    ]);

    return serializePrisma({
      success: true,
      problems,
      progress
    });
  } catch (err) {
    return { success: false, problems: [], progress: [] };
  }
}
