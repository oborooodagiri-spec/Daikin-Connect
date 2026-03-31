"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { serializePrisma } from "@/lib/serialize";
import { startOfDay, endOfDay, differenceInDays } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";

export async function getComprehensiveReportData(projectId: string, startDate?: string, endDate?: string) {
  noStore();
  const session = await getSession();
  if (!session) return { error: "Unauthorized access" };

  try {
    const sDate = startDate ? startOfDay(new Date(startDate)) : null;
    const eDate = endDate ? endOfDay(new Date(endDate)) : null;

    const whereClause: any = { project_ref_id: BigInt(projectId) };
    
    // 1. Fetch Units
    const units = await (prisma.units as any).findMany({
      where: whereClause,
      include: {
        activities: {
          where: sDate && eDate ? {
            service_date: {
              gte: sDate,
              lte: eDate
            }
          } : {},
          orderBy: { service_date: 'desc' }
        },
        schedules: {
          where: sDate && eDate ? {
            start_at: {
              gte: sDate,
              lte: eDate
            }
          } : {},
        }
      }
    });

    // 2. Fetch Complaints for the project
    const complaints = await (prisma.complaints as any).findMany({
      where: {
        units: { project_ref_id: BigInt(projectId) },
        ...(sDate && eDate ? {
          created_at: {
            gte: sDate,
            lte: eDate
          }
        } : {})
      },
      include: { units: true },
      orderBy: { created_at: 'desc' }
    });

    // 3. Project Info
    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
      include: { customers: true }
    });

    // 4. Calculate SLA & Pareto (Logic)
    let totalScheduledPM = 0;
    let totalActualPM = 0;
    const issueFrequency: Record<string, number> = {};

    units.forEach((u: any) => {
      // PM Compliance: Scheduled vs Completed
      totalScheduledPM += u.schedules.filter((s: any) => s.type === "Preventive").length;
      totalActualPM += u.activities.filter((a: any) => a.type === "Preventive").length;

      u.activities.forEach((a: any) => {
        if (a.type === "Corrective") {
          // Pareto logic: Count engineer notes or types
          const key = a.engineer_note || "Other Issue";
          issueFrequency[key] = (issueFrequency[key] || 0) + 1;
        }
      });
    });

    // Sort Pareto
    const topIssues = Object.entries(issueFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const pmCompliance = totalScheduledPM > 0 
      ? Math.round((totalActualPM / totalScheduledPM) * 100) 
      : (totalActualPM > 0 ? 100 : 0);

    return serializePrisma({
      success: true,
      data: {
        project,
        units,
        complaints,
        topIssues,
        stats: {
          totalUnits: units.length,
          problemUnits: units.filter((u: any) => u.status === "Problem").length,
          onProgressUnits: units.filter((u: any) => u.status === "On_Progress").length,
          normalUnits: units.filter((u: any) => u.status === "Normal").length,
          pmCompliance,
          pmTarget: totalScheduledPM,
          pmActual: totalActualPM
        }
      }
    });

  } catch (error: any) {
    console.error("Report data error:", error);
    return { error: "Failed to fetch report data" };
  }
}
