"use server";

import { prisma } from "@/lib/prisma";
import { processReportData } from "@/lib/reportDataHelper";
import { serializePrisma } from "@/lib/serialize";
import { getSession } from "./auth";

export async function getConsolidatedMonthlyReport(projectId: string, month: number, year: number, type?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const whereClause: any = {
      units: {
        project_ref_id: BigInt(projectId)
      },
      service_date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (type === 'Operations' || !type) {
      whereClause.type = { in: ['Preventive', 'Corrective', 'Audit'] };
    } else if (type !== 'All') {
      whereClause.type = type;
    } else if (type === 'All') {
      // Keep as is to show everything, but we'll default UI to Operations
    }

    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      include: { 
        customers: { select: { name: true } },
        units: { select: { unit_type: true } }
      }
    });

    const activities = await prisma.service_activities.findMany({
      where: whereClause,
      include: {
        units: true,
        activity_photos: true,
        audit_velocity_points: true
      },
      orderBy: {
        service_date: 'asc'
      }
    });

    const complaints = await prisma.complaints.findMany({
      where: {
        units: { project_ref_id: BigInt(projectId) },
        created_at: { gte: startDate, lte: endDate }
      },
      include: { units: true }
    });

    // Process and aggregate
    const processed = activities.map(act => processReportData(act));

    // Group Activities by Unit Type
    const activitiesByType: Record<string, any[]> = {};
    processed.forEach(act => {
      const uType = (act.units?.unit_type || "N/A").toUpperCase();
      if (!activitiesByType[uType]) activitiesByType[uType] = [];
      activitiesByType[uType].push(act);
    });

    // Calculate Achievement Metrics
    const targets = await prisma.schedule_targets.findMany({
      where: {
        project_id: BigInt(projectId),
        month,
        year
      }
    });

    const totalTarget = targets.reduce((sum, t) => sum + (t.monthly_target || 0), 0);
    const totalActual = processed.length;
    const achievementRate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 100;

    // Unit Type Summary (The data for separate tabs)
    const projectUnitTypes = Array.from(new Set(
      project?.units?.map(u => u.unit_type).filter((ut): ut is string => !!ut && ut.toUpperCase() !== 'N/A') || []
    ));
    
    const summaryByType = projectUnitTypes.map(uType => {
      const typeKey = uType.toUpperCase();
      const actual = activitiesByType[typeKey]?.length || 0;
      const unitCount = project?.units?.filter(u => u.unit_type === uType).length || 0;
      return {
        type: uType,
        actual,
        unitCount,
        achievement: unitCount > 0 ? Math.round((actual / unitCount) * 100) : 0
      };
    });

    // Aggregations for Charts
    const statusDistribution = [
      { name: "Normal", value: processed.filter(p => p.units?.status === 'Normal').length },
      { name: "Warning", value: processed.filter(p => p.units?.status === 'Warning').length },
      { name: "Problem", value: processed.filter(p => p.units?.status === 'Problem' || p.units?.status === 'Critical').length },
    ].filter(s => s.value > 0);

    const typeDistribution = summaryByType.map(s => ({
      name: s.type,
      value: s.actual
    }));

    // Weekly Trends (Dynamic 4-5 weeks based on month days)
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = Math.ceil(daysInMonth / 7);
    
    const weeklyTrends = Array.from({ length: weeks }, (_, i) => {
      const week = i + 1;
      const weekStart = new Date(year, month - 1, (week - 1) * 7 + 1);
      const weekEnd = week === weeks 
        ? new Date(year, month - 1, daysInMonth, 23, 59, 59)
        : new Date(year, month - 1, week * 7, 23, 59, 59);
        
      return {
        name: `W${week}`,
        actual: processed.filter(p => {
          const d = new Date(p.service_date);
          return d >= weekStart && d <= weekEnd;
        }).length,
        target: Math.round(totalTarget / weeks)
      };
    });

    // Site Health Summary
    const avgPerformance = processed.length > 0 
      ? processed.reduce((sum, p) => sum + (p?.performance?.score || 0), 0) / processed.length
      : 0;

    // Health Distribution specifically for Audits
    const auditActivities = processed.filter(p => p.type === 'Audit');
    const healthDistribution = [
      { name: "Excellent", value: auditActivities.filter(a => a.performance?.score >= 90).length, color: "#10B981" },
      { name: "Stable", value: auditActivities.filter(a => a.performance?.score >= 80 && a.performance?.score < 90).length, color: "#00a1e4" },
      { name: "Moderate", value: auditActivities.filter(a => a.performance?.score >= 60 && a.performance?.score < 80).length, color: "#F59E0B" },
      { name: "Critical", value: auditActivities.filter(a => a.performance?.score < 60).length, color: "#EF4444" },
    ].filter(h => h.value > 0);

    return serializePrisma({
      success: true,
      data: {
        project,
        activities: processed,
        activitiesByType,
        summaryByType,
        complaints,
        charts: {
          statusDistribution,
          typeDistribution,
          weeklyTrends,
          healthDistribution
        },
        summary: {
          totalTarget,
          totalActual,
          achievementRate: Math.round(achievementRate),
          avgPerformance: Math.round(avgPerformance),
          monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate),
          year
        }
      }
    });
  } catch (error: any) {
    console.error("Consolidated Report Error:", error);
    return { success: false, error: "Failed to build consolidated report" };
  }
}
