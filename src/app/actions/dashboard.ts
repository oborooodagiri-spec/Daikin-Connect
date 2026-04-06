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

    const [
      auditActual, auditTarget, 
      pmActual, pmTargetMetrics, 
      corKPI,
      corActual,
      totalUnits,
      activeProjects,
      totalCustomers
    ] = await Promise.all([
      fetchTypeActuals("Audit"),
      fetchTypeTargets("Audit"),
      fetchTypeActuals("Preventive"),
      fetchTypeTargets("Preventive"),
      fetchCorrectiveKPI(),
      fetchTypeActuals("Corrective"),
      (prisma.units as any).count({ where: unitWhere }),
      (prisma.projects as any).count({ 
        where: { 
          status: "active", 
          ...(filters.customerId ? { customer_id: parseInt(filters.customerId) } : {}),
          ...(accessibleIds ? { id: { in: accessibleIds } } : {})
        } 
      }),
      filters.customerId ? 1 : (prisma.customers as any).count({ where: { is_active: true } })
    ]);

    return {
      audit: { actual: auditActual, target: auditTarget },
      preventive: { actual: pmActual, target: pmTargetMetrics },
      corrective: { 
        actual: corActual, 
        kpi: corKPI 
      }, 
      databaseAssets: totalUnits,
      activeSites: activeProjects,
      totalCustomers: totalCustomers,
    };
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
    corrective: { actual: { daily:0, monthly:0, total:0 }, target: { daily:0, monthly:0, total:0 } }, 
    databaseAssets: 0, activeSites: 0, totalCustomers: 0 
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
    
    const activities = await (prisma.service_activities as any).findMany({
      where: {
        ...activityWhere,
        service_date: { gte: startOfYear }
      },
      select: { service_date: true, type: true }
    });

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentMonth = new Date().getMonth();
    
    const chartData = months.slice(0, currentMonth + 1).map((name, i) => {
      const monthActivities = activities.filter((a: any) => a.service_date && new Date(a.service_date).getMonth() === i);
      return {
        name,
        audit: monthActivities.filter((a: any) => a.type === "Audit").length,
        preventive: monthActivities.filter((a: any) => a.type === "Preventive").length,
        corrective: monthActivities.filter((a: any) => a.type === "Corrective").length,
      };
    });

    return serializePrisma(chartData);
  } catch (error) {
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
        orderBy: { created_at: "desc" },
        select: { id: true, tag_number: true, area: true, model: true, room_tenant: true, status: true, created_at: true, project_ref_id: true, qr_code_token: true, projects: { select: { name: true } } }
      }),
      (prisma.units as any).findMany({
        where: { ...unitWhere, status: { in: ["On_Progress", "Pending"] } },
        take: 5,
        orderBy: { created_at: "desc" },
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
